import MinistryService from "../Services/MinistryService.js";
import { sendSuccess, sendError } from "../core/response.js";

class MinistryController {
    async getAllMinistries(req, res) {
        const ministries = await MinistryService.getAllMinistries();
        return sendSuccess(res, { message: "Ministries fetched successfully", data: ministries });
    }

    async getMinistryById(req, res) {
        const ministry = await MinistryService.getMinistryById(req.params.id);
        if (!ministry) return sendError(res, { message: "Ministry not found", statusCode: 404 });
        return sendSuccess(res, { message: "Ministry fetched successfully", data: ministry });
    }

    async createMinistry(req, res) {
        const ministry = await MinistryService.createMinistry(req.body);
        return sendSuccess(res, { message: "Ministry created successfully", data: ministry, statusCode: 201 });
    }
}

export default new MinistryController();
