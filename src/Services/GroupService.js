import { GroupRepository } from "../repositories/GroupRepository.js";

class GroupService {
    async createGroup(data) {
        const group = await GroupRepository.createGroup(data);
        // Automatically add creator as Admin
        await GroupRepository.addMember({
            groupId: group.id || group._id,
            userId: data.creatorId,
            role: 'Admin'
        });
        return group;
    }

    async getDiscoverGroups() {
        return await GroupRepository.findAllGroups({ isPrivate: false });
    }

    async getUserGroups(userId) {
        // This would ideally be a join or a specific member query
        // For now, let's keep it simple
        return await GroupRepository.findAllGroups();
    }

    async getGroupById(id) {
        return await GroupRepository.findGroupById(id);
    }

    async joinGroup(groupId, userId) {
        return await GroupRepository.addMember({ groupId, userId, role: 'Member' });
    }

    async sendMessage(groupId, senderId, content, type = 'text') {
        return await GroupRepository.createMessage({ groupId, senderId, content, type });
    }

    async getGroupMessages(groupId) {
        return await GroupRepository.findMessagesByGroup(groupId);
    }
}

export default new GroupService();
