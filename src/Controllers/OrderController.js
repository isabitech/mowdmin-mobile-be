
import OrderService from "../Services/OrderService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreateOrder, validateUpdateOrder } from "../validators/orderValidators.js";

class OrderController {
  async create(req, res) {
    const { error, value } = validateCreateOrder(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const order = await OrderService.createOrder(value);
    return sendSuccess(res, { message: "Order Created Successfully", data: order });
  }
  async getAll(req, res) {
    const orders = await OrderService.getAllOrders();
    return sendSuccess(res, { message: "All Orders Fetched Successfully", data: orders });
  }
  async getOne(req, res) {
    const order = await OrderService.getOrderById(req.params.id);
    return sendSuccess(res, { message: "Order Fetched Successfully", data: order });
  }
  async getUserOrders(req, res) {
    const orders = await OrderService.getOrdersByUser(req.user.id);
    return sendSuccess(res, { message: "User Orders Fetched Successfully", data: orders });
  }
  async update(req, res) {
    const { error, value } = validateUpdateOrder(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const order = await OrderService.updateOrder(req.params.id, value);
    return sendSuccess(res, { message: "Order Updated Successfully", data: order });
  }
  async delete(req, res) {
    await OrderService.deleteOrder(req.params.id);
    return sendSuccess(res, { message: "Order Deleted Successfully", data: {} });
  }
}

export default new OrderController();