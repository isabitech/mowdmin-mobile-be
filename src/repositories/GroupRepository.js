import { Group, GroupMember, GroupMessage } from "../Models/GroupModels.js";
let GroupModel, MemberModel, MessageModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const GroupRepository = {
    async getModels() {
        if (!GroupModel || !MemberModel || !MessageModel) {
            if (isMongo) {
                const mongoModels = await import('../MongoModels/GroupMongoModels.js');
                GroupModel = mongoModels.Group;
                MemberModel = mongoModels.GroupMember;
                MessageModel = mongoModels.GroupMessage;
                // Ensure UserMongo model is registered for population
                await import('../MongoModels/UserMongoModel.js');
            } else {
                const sqlModels = await import('../Models/GroupModels.js');
                GroupModel = sqlModels.Group;
                MemberModel = sqlModels.GroupMember;
                MessageModel = sqlModels.GroupMessage;
            }
        }
        return { GroupModel, MemberModel, MessageModel };
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
                .populate('creatorId', 'name email photo');

            // Attach member count to each group
            const groupsWithCounts = await Promise.all(
                groups.map(async (group) => {
                    const memberCount = await MemberModel.countDocuments({ groupId: group._id });
                    const groupObj = group.toObject();
                    groupObj.memberCount = memberCount;
                    return groupObj;
                })
            );
            return groupsWithCounts;
        }
        return await GroupModel.findAll({ where: filters });
    },

    async findGroupById(id) {
        const { GroupModel, MemberModel } = await this.getModels();
        if (isMongo) {
            const group = await GroupModel.findById(id)
                .populate('creatorId', 'name email photo');

            if (!group) return null;

            // Get members with user details
            const members = await MemberModel.find({ groupId: id })
                .populate('userId', 'name email photo');

            const memberCount = members.length;

            const groupObj = group.toObject();
            groupObj.memberCount = memberCount;
            groupObj.members = members;
            return groupObj;
        }
        return await GroupModel.findByPk(id);
    },

    // Membership Operations
    async addMember(data) {
        const { MemberModel } = await this.getModels();
        return await MemberModel.create(data);
    },

    async findMembersByGroup(groupId) {
        const { MemberModel } = await this.getModels();
        if (isMongo) return await MemberModel.find({ groupId }).populate('userId', 'name email photo');
        return await MemberModel.findAll({ where: { groupId } });
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
            const memberships = await MemberModel.find({ userId })
                .populate({
                    path: 'groupId',
                    populate: { path: 'creatorId', select: 'name email photo' }
                });

            // For each group, also attach member count
            const groups = await Promise.all(
                memberships
                    .map(m => m.groupId)
                    .filter(g => g !== null)
                    .map(async (group) => {
                        const memberCount = await MemberModel.countDocuments({ groupId: group._id });
                        const groupObj = group.toObject();
                        groupObj.memberCount = memberCount;
                        return groupObj;
                    })
            );
            return groups;
        }
        // For SQL, we assume a belongsTo/hasMany relationship is set up or use a join
        return await GroupModel.findAll({
            include: [{
                model: MemberModel,
                where: { userId },
                required: true
            }]
        });
    },

    // Message Operations
    async createMessage(data) {
        const { MessageModel } = await this.getModels();
        return await MessageModel.create(data);
    },

    async findMessagesByGroup(groupId) {
        const { MessageModel } = await this.getModels();
        if (isMongo) {
            return await MessageModel.find({ groupId })
                .populate('senderId', 'name email photo')
                .sort({ createdAt: 1 });
        }
        return await MessageModel.findAll({ where: { groupId }, order: [['createdAt', 'ASC']] });
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
    }
};
