import ProfileRepository from "./ProfileRepository.js";

let GroupModel, MemberModel, MessageModel, UserModel;

const isMongo = process.env.DB_CONNECTION === "mongodb";

export const GroupRepository = {
  async getModels() {
    if (!GroupModel || !MemberModel || !MessageModel || !UserModel) {
      if (isMongo) {
        const mongoModels = await import("../MongoModels/GroupMongoModels.js");
        GroupModel = mongoModels.Group;
        MemberModel = mongoModels.GroupMember;
        MessageModel = mongoModels.GroupMessage;
        // Ensure UserMongo model is registered for population
        const userMongo = await import("../MongoModels/UserMongoModel.js");
        UserModel = userMongo.default;
      } else {
        const sqlModels = await import("../Models/GroupModels.js");
        GroupModel = sqlModels.Group;
        MemberModel = sqlModels.GroupMember;
        MessageModel = sqlModels.GroupMessage;
        const userSql = await import("../Models/UserModel.js");
        UserModel = userSql.default;
      }
    }
    return { GroupModel, MemberModel, MessageModel, UserModel };
  },

  // Group Operations
  async createGroup(data) {
    const { GroupModel } = await this.getModels();
    return await GroupModel.create(data);
  },

  async findAllGroups(filters = {}) {
    const { GroupModel, MemberModel } = await this.getModels();
    if (isMongo) {
      const groups = await GroupModel.find(filters)
        .populate("creatorId", "name email photo")
        .lean();

      const groupIds = groups.map((g) => g._id);
      const counts = await MemberModel.aggregate([
        { $match: { groupId: { $in: groupIds } } },
        { $group: { _id: "$groupId", count: { $sum: 1 } } },
      ]);
      const countMap = Object.fromEntries(
        counts.map((c) => [c._id.toString(), c.count]),
      );

      return groups.map((group) => {
        group.memberCount = countMap[group._id.toString()] || 0;
        return group;
      });
    }
    const { UserModel } = await this.getModels();
    return await GroupModel.findAll({
      where: filters,
      include: [
        {
          model: UserModel,
          as: "creator",
          attributes: ["name", "email", "profilePicture"],
        },
      ],
    });
  },

  async findGroupById(id) {
    const { GroupModel, MemberModel } = await this.getModels();
    if (isMongo) {
      const group = await GroupModel.findById(id).populate(
        "creatorId",
        "name email photo",
      );

      if (!group) return null;

      // Get members with user details
      const members = await MemberModel.find({ groupId: id }).populate(
        "userId",
        "name email photo",
      );

      const memberCount = members.length;

      const groupObj = group.toObject();
      groupObj.memberCount = memberCount;
      groupObj.members = members;
      return groupObj;
    }
    const { UserModel } = await this.getModels();
    return await GroupModel.findByPk(id, {
      include: [
        {
          model: UserModel,
          as: "creator",
          attributes: ["name", "email", "profilePicture"],
        },
        {
          model: MemberModel,
          as: "members",
          include: [
            {
              model: UserModel,
              as: "user",
              attributes: ["name", "email", "profilePicture"],
            },
          ],
        },
      ],
    });
  },

  // Membership Operations
  async addMember(data) {
    const { MemberModel } = await this.getModels();
    return await MemberModel.create(data);
  },

  async findMembersByGroup(groupId) {
    const { MemberModel, UserModel } = await this.getModels();
    if (isMongo)
      return await MemberModel.find({ groupId }).populate(
        "userId",
        "name email photo",
      );
    return await MemberModel.findAll({
      where: { groupId },
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: ["name", "email", "profilePicture"],
        },
      ],
    });
  },

  async findMember(groupId, userId) {
    const { MemberModel } = await this.getModels();
    if (isMongo) return await MemberModel.findOne({ groupId, userId });
    return await MemberModel.findOne({ where: { groupId, userId } });
  },

  async removeMember(groupId, userId) {
    const { MemberModel } = await this.getModels();
    if (isMongo) return await MemberModel.findOneAndDelete({ groupId, userId });
    return await MemberModel.destroy({ where: { groupId, userId } });
  },

  async findGroupsByUserId(userId) {
    const { MemberModel, GroupModel } = await this.getModels();
    if (isMongo) {
      const memberships = await MemberModel.find({ userId }).populate({
        path: "groupId",
        populate: { path: "creatorId", select: "name email photo" },
      });

      const validGroups = memberships
        .map((m) => m.groupId)
        .filter((g) => g !== null);
      const groupIds = validGroups.map((g) => g._id);
      const counts = await MemberModel.aggregate([
        { $match: { groupId: { $in: groupIds } } },
        { $group: { _id: "$groupId", count: { $sum: 1 } } },
      ]);
      const countMap = Object.fromEntries(
        counts.map((c) => [c._id.toString(), c.count]),
      );

      return validGroups.map((group) => {
        const groupObj = group.toObject();
        groupObj.memberCount = countMap[group._id.toString()] || 0;
        return groupObj;
      });
    }
    // For SQL, we assume a belongsTo/hasMany relationship is set up or use a join
    const { UserModel } = await this.getModels();
    return await GroupModel.findAll({
      include: [
        {
          model: MemberModel,
          where: { userId },
          required: true,
          attributes: [], // Don't return membership data, just use for filtering
        },
        {
          model: UserModel,
          as: "creator",
          attributes: ["name", "email", "profilePicture"],
        },
      ],
    });
  },

  // Message Operations
  async createMessage(data) {
    const { MessageModel } = await this.getModels();
    return await MessageModel.create(data);
  },

  async findMessagesByGroup(groupId) {
    const { MessageModel, UserModel } = await this.getModels();
    const { ProfileModel } = await ProfileRepository.getModels();

    if (isMongo) {
      const messages = await MessageModel.find({ groupId })
        .populate("senderId", "name email photo")
        .sort({ createdAt: 1 })
        .lean();

      const senderIds = [
        ...new Set(
          messages.map((m) => m.senderId?._id?.toString()).filter((id) => id),
        ),
      ];
      if (senderIds.length > 0) {
        const profiles = await ProfileModel.find({
          userId: { $in: senderIds },
        }).lean();
        const profileMap = Object.fromEntries(
          profiles.map((p) => [p.userId.toString(), p]),
        );

        messages.forEach((m) => {
          if (m.senderId) {
            const profile = profileMap[m.senderId._id.toString()];
            if (profile && profile.photoUrl) {
              m.senderId.photo = profile.photoUrl;
            } else {
              m.senderId.photo = null;
            }
          }
        });
      }
      return messages;
    }

    const messages = await MessageModel.findAll({
      where: { groupId },
      include: [
        {
          model: UserModel,
          as: "sender",
          attributes: ["id", "name", "email", "profilePicture"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const senderIds = [
      ...new Set(messages.map((m) => m.sender?.id).filter((id) => id)),
    ];
    if (senderIds.length > 0) {
      const profiles = await ProfileModel.findAll({
        where: { userId: senderIds },
      });
      const profileMap = Object.fromEntries(profiles.map((p) => [p.userId, p]));

      messages.forEach((m) => {
        if (m.sender) {
          const profile = profileMap[m.sender.id];
          if (profile && profile.photoUrl) {
            m.sender.dataValues.profilePicture = profile.photoUrl;
            m.sender.profilePicture = profile.photoUrl;
          } else {
            m.sender.dataValues.profilePicture = null;
            m.sender.profilePicture = null;
          }
        }
      });
    }
    return messages;
  },

  async deleteGroup(id) {
    const { GroupModel, MemberModel, MessageModel } = await this.getModels();
    if (isMongo) {
      // Also clean up members and messages when deleting a group
      await MemberModel.deleteMany({ groupId: id });
      await MessageModel.deleteMany({ groupId: id });
      return await GroupModel.findByIdAndDelete(id);
    }
    return await GroupModel.destroy({ where: { id } });
  },
};
