import OrderItemService from "../Services/OrderItemService.js";
import { success } from "../Utils/helper.js";

class OrderItemController {
    async create(req, res) {
        const orderItem = await OrderItemService.createOrderItem(req.body);
        return success(res, "Order Item Created Successfully", orderItem);
    }

    async getAll(req, res) {
        const orderItems = await OrderItemService.getAllOrderItems();
        return success(res, "All Order Items Fetched Successfully", orderItems);
    }

    async getOne(req, res) {
        const orderItem = await OrderItemService.getOrderItemById(req.params.id);
        return success(res, "Order Item Fetched Successfully", orderItem);
    }

    async getItemsByOrder(req, res) {
        const items = await OrderItemService.getItemsByOrderId(req.params.orderId);
        return success(res, "Order Items Fetched Successfully", items);
    }

    async update(req, res) {
        const orderItem = await OrderItemService.updateOrderItem(req.params.id, req.body);
        return success(res, "Order Item Updated Successfully", orderItem);
    }

    async delete(req, res) {
        await OrderItemService.deleteOrderItem(req.params.id);
        return success(res, "Order Item Deleted Successfully");
    }
}

export default new OrderItemController();
