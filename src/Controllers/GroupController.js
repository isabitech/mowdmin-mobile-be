import GroupService from "../Services/GroupService.js";
import { sendSuccess, sendError } from "../core/response.js";

class GroupController {
    async createGroup(req, res) {
        const data = { ...req.body, creatorId: req.user.id };
        const group = await GroupService.createGroup(data);
        return sendSuccess(res, { message: "Group created successfully", data: group, statusCode: 201 });
    }

    async getDiscoverGroups(req, res) {
        const groups = await GroupService.getDiscoverGroups();
        return sendSuccess(res, { message: "Discovery groups fetched", data: groups });
    }

    async getMyGroups(req, res) {
        const groups = await GroupService.getUserGroups(req.user.id);
        return sendSuccess(res, { message: "User groups fetched", data: groups });
    }

    async getGroupDetails(req, res) {
        const group = await GroupService.getGroupById(req.params.id);
        if (!group) return sendError(res, { message: "Group not found", statusCode: 404 });
        return sendSuccess(res, { message: "Group details fetched", data: group });
    }

    async joinGroup(req, res) {
        const membership = await GroupService.joinGroup(req.params.id, req.user.id);
        return sendSuccess(res, { message: "Joined group successfully", data: membership });
    }

    async sendMessage(req, res) {
        const message = await GroupService.sendMessage(req.params.id, req.user.id, req.body.content, req.body.type);
        return sendSuccess(res, { message: "Message sent", data: message, statusCode: 201 });
    }

    async getGroupMessages(req, res) {
        const messages = await GroupService.getGroupMessages(req.params.id);
        return sendSuccess(res, { message: "Group messages fetched", data: messages });
    }

    async deleteGroup(req, res) {
        await GroupService.deleteGroup(req.params.id);
        return sendSuccess(res, { message: "Group deleted successfully (Admin)", data: null, statusCode: 200 });
    }
}

export default new GroupController();
