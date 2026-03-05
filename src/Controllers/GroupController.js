import GroupService from "../Services/GroupService.js";
import { sendSuccess, sendError } from "../core/response.js";

class GroupController {
    async createGroup(req, res) {
        const { name, description, image } = req.body;
        const userId = req.user.id;
        const data = { name, description, image, creatorId: userId };
        const group = await GroupService.createGroup(data);
        return sendSuccess(res, { message: "Group created successfully", data: group, statusCode: 201 });
    }

    async getDiscoverGroups(req, res) {
        const groups = await GroupService.getDiscoverGroups();
        return sendSuccess(res, { message: "Discovery groups fetched", data: groups });
    }

    async getMyGroups(req, res) {
        const userId = req.user.id;
        const groups = await GroupService.getUserGroups(userId);
        return sendSuccess(res, { message: "User groups fetched", data: groups });
    }

    async getGroupDetails(req, res) {
        const groupId = req.params.id;
        const group = await GroupService.getGroupById(groupId);
        if (!group) return sendError(res, { message: "Group not found", statusCode: 404 });
        return sendSuccess(res, { message: "Group details fetched", data: group });
    }

    async joinGroup(req, res) {
        const groupId = req.params.id;
        const userId = req.user.id;
        const membership = await GroupService.joinGroup(groupId, userId);
        return sendSuccess(res, { message: "Joined group successfully", data: membership });
    }

    async leaveGroup(req, res) {
        const groupId = req.params.id;
        const userId = req.user.id;
        await GroupService.leaveGroup(groupId, userId);
        return sendSuccess(res, { message: "Left group successfully", data: null });
    }

    async sendMessage(req, res) {
        const { message, type } = req.body;
        const groupId = req.params.id;
        const userId = req.user.id;
        const sentMessage = await GroupService.sendMessage(groupId, userId, message, type);
        return sendSuccess(res, { message: "Message sent", data: sentMessage, statusCode: 201 });
    }

    async getGroupMessages(req, res) {
        const groupId = req.params.id;
        const messages = await GroupService.getGroupMessages(groupId);
        return sendSuccess(res, { message: "Group messages fetched", data: messages });
    }

    async deleteGroup(req, res) {
        const groupId = req.params.id;
        await GroupService.deleteGroup(groupId);
        return sendSuccess(res, { message: "Group deleted successfully (Admin)", data: null, statusCode: 200 });
    }
}

export default new GroupController();
