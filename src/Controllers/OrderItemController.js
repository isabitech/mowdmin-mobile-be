import OrderItemService from "../Services/OrderItemService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreateOrderItem, validateUpdateOrderItem } from "../middleware/Validation/orderItemValidation.js";

class OrderItemController {
    async create(req, res) {
        const { error, value } = validateCreateOrderItem(req.body);
        if (error) {
            return sendError(res, { message: error.details[0].message, statusCode: 400 });
        }

        const orderItem = await OrderItemService.addItem(value);
        return sendSuccess(res, { message: "Order Item Created Successfully", data: orderItem, statusCode: 201 });
    }
    async getAll(req, res) {
        const orderItems = await OrderItemService.getItemsByOrder(req.query.orderId);
        return sendSuccess(res, { message: "All Order Items Fetched Successfully", data: orderItems });
    }
    async getOne(req, res) {
        const orderItem = await OrderItemService.getItemById(req.params.id);
        return sendSuccess(res, { message: "Order Item Fetched Successfully", data: orderItem });
    }
    async getItemsByOrder(req, res) {
        const items = await OrderItemService.getItemsByOrderId(req.params.orderId);
        return sendSuccess(res, { message: "Order Items Fetched Successfully", data: items });
    }
    async update(req, res) {
        const { error, value } = validateUpdateOrderItem(req.body);
        if (error) {
            return sendError(res, { message: error.details[0].message, statusCode: 400 });
        }

        const orderItem = await OrderItemService.updateItem(req.params.id, value);
        return sendSuccess(res, { message: "Order Item Updated Successfully", data: orderItem });
    }
    async delete(req, res) {
        await OrderItemService.deleteItem(req.params.id);
        return sendSuccess(res, { message: "Order Item Deleted Successfully", data: {} });
    }
}
export default new OrderItemController();
