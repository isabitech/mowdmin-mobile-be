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
        const { GroupModel } = await this.getModels();
        if (isMongo) return await GroupModel.find(filters);
        return await GroupModel.findAll({ where: filters });
    },

    async findGroupById(id) {
        const { GroupModel } = await this.getModels();
        if (isMongo) return await GroupModel.findById(id);
        return await GroupModel.findByPk(id);
    },

    // Membership Operations
    async addMember(data) {
        const { MemberModel } = await this.getModels();
        return await MemberModel.create(data);
    },

    async findMembersByGroup(groupId) {
        const { MemberModel } = await this.getModels();
        if (isMongo) return await MemberModel.find({ groupId });
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
            const memberships = await MemberModel.find({ userId }).populate('groupId');
            return memberships.map(m => m.groupId).filter(g => g !== null);
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
        if (isMongo) return await MessageModel.find({ groupId }).sort({ createdAt: 1 });
        return await MessageModel.findAll({ where: { groupId }, order: [['createdAt', 'ASC']] });
    },

    async deleteGroup(id) {
        const { GroupModel } = await this.getModels();
        if (isMongo) return await GroupModel.findByIdAndDelete(id);
        return await GroupModel.destroy({ where: { id } });
    }
};
