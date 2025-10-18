
import OrderService from "../Services/OrderService.js";
import { success } from "../Utils/helper.js";

class OrderController {
  async create(req, res) {
    const order = await OrderService.createOrder(req.body);
    return success(res, "Order Created Successfully", order);
  }

  async getAll(req, res) {
    const orders = await OrderService.getAllOrders();
    return success(res, "All Orders Fetched Successfully", orders);
  }

  async getOne(req, res) {
    const order = await OrderService.getOrderById(req.params.id);
    return success(res, "Order Fetched Successfully", order);
  }

  async getUserOrders(req, res) {
    const orders = await OrderService.getOrdersByUser(req.user.id);
    return success(res, "User Orders Fetched Successfully", orders);
  }

  async update(req, res) {
    const order = await OrderService.updateOrder(req.params.id, req.body);
    return success(res, "Order Updated Successfully", order);
  }

  async delete(req, res) {
    await OrderService.deleteOrder(req.params.id);
    return success(res, "Order Deleted Successfully");
  }
}

export default new OrderController();