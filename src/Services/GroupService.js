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
        return await GroupRepository.findGroupsByUserId(userId);
    }

    async getGroupById(id) {
        return await GroupRepository.findGroupById(id);
    }

    async joinGroup(groupId, userId) {
        const existingMember = await GroupRepository.findMember(groupId, userId);
        if (existingMember) {
            throw new Error("You are already a member of this group");
        }
        return await GroupRepository.addMember({ groupId, userId, role: 'Member' });
    }

    async leaveGroup(groupId, userId) {
        const existingMember = await GroupRepository.findMember(groupId, userId);
        if (!existingMember) {
            throw new Error("You are not a member of this group");
        }
        return await GroupRepository.removeMember(groupId, userId);
    }

    async sendMessage(groupId, senderId, content, type = 'text') {
        return await GroupRepository.createMessage({ groupId, senderId, content, type });
    }

    async getGroupMessages(groupId) {
        return await GroupRepository.findMessagesByGroup(groupId);
    }

    async deleteGroup(groupId) {
        return await GroupRepository.deleteGroup(groupId);
    }
}

export default new GroupService();
