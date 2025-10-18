import PaymentService from "../Services/PaymentService.js";
import { success } from "../Utils/helper.js";

class PaymentController {
  async create(req, res) {
    const payment = await PaymentService.createPayment(req.body);
    return success(res, "Payment Created Successfully", payment);
  }

  async getAll(req, res) {
    const payments = await PaymentService.getAllPayments();
    return success(res, "All Payments Fetched Successfully", payments);
  }

  async getOne(req, res) {
    const payment = await PaymentService.getPaymentById(req.params.id);
    return success(res, "Payment Fetched Successfully", payment);
  }

  async getByOrder(req, res) {
    const payment = await PaymentService.getPaymentByOrderId(req.params.orderId);
    return success(res, "Order Payment Fetched Successfully", payment);
  }

  async update(req, res) {
    const payment = await PaymentService.updatePayment(req.params.id, req.body);
    return success(res, "Payment Updated Successfully", payment);
  }

  async delete(req, res) {
    await PaymentService.deletePayment(req.params.id);
    return success(res, "Payment Deleted Successfully");
  }
}

export default new PaymentController();
