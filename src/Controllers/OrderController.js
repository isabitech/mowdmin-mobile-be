
import OrderService from "../Services/OrderService.js";
import PaymentService from "../Services/PaymentService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreateOrder, validateUpdateOrder } from "../middleware/Validation/orderValidation.js";

class OrderController {
  async create(req, res) {
    const { error, value } = validateCreateOrder(req.body);
    value.userId = req.user.id;
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const order = await OrderService.createOrder(value);
    return sendSuccess(res, { message: "Order Created Successfully", data: order, statusCode: 201 });
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
    console.log("OrderController: req.user.id =", req.user.id);
    const orders = await OrderService.getOrdersByUser(req.user.id);
    console.log("OrderController: Fetched orders count =", orders.length);
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
    return sendSuccess(res, { message: "Order deleted successfully", data: {} });
  }

  async cancel(req, res) {
    const order = await OrderService.cancelOrder(req.params.id);
    if (!order) return sendError(res, { message: "Order not found", statusCode: 404 });
    return sendSuccess(res, { message: "Order cancelled successfully (Admin)", data: order });
  }

  async payForOrder(req, res) {
    const orderId = req.params.id;
    const userId = req.user._id || req.user.id;

    // Fetch the order and validate
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return sendError(res, { message: "Order not found", statusCode: 404 });
    }
    if (order.status !== 'pending') {
      return sendError(res, { message: `Cannot pay for an order with status '${order.status}'`, statusCode: 400 });
    }

    // Parse the totalAmount (may be Decimal128)
    const amount = parseFloat(order.totalAmount.toString());
    if (!amount || amount <= 0) {
      return sendError(res, { message: "Order has an invalid total amount", statusCode: 400 });
    }

    // Create a Stripe PaymentIntent linked to this order
    const paymentResult = await PaymentService.createPaymentIntent(
      userId,
      amount,
      'USD',
      'order',
      { orderId: orderId.toString() }
    );

    return sendSuccess(res, {
      message: "Payment intent created for order",
      data: paymentResult,
      statusCode: 201,
    });
  }
}

export default new OrderController();