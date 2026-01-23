import PaymentService from "../Services/PaymentService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { validateCreatePayment, validateUpdatePayment } from "../validators/paymentValidators.js";

class PaymentController {
  async create(req, res) {
    const { error, value } = validateCreatePayment(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const payment = await PaymentService.createPayment(value);
    return sendSuccess(res, { message: "Payment Created Successfully", data: payment });
  }
  async getAll(req, res) {
    const payments = await PaymentService.getAllPayments();
    return sendSuccess(res, { message: "All Payments Fetched Successfully", data: payments });
  }
  async getOne(req, res) {
    const payment = await PaymentService.getPaymentById(req.params.id);
    return sendSuccess(res, { message: "Payment Fetched Successfully", data: payment });
  }
  async getByOrder(req, res) {
    const payment = await PaymentService.getPaymentByOrderId(req.params.orderId);
    return sendSuccess(res, { message: "Order Payment Fetched Successfully", data: payment });
  }
  async update(req, res) {
    const { error, value } = validateUpdatePayment(req.body);
    if (error) {
      return sendError(res, { message: error.details[0].message, statusCode: 400 });
    }

    const payment = await PaymentService.updatePayment(req.params.id, value);
    return sendSuccess(res, { message: "Payment Updated Successfully", data: payment });
  }
  async delete(req, res) {
    await PaymentService.deletePayment(req.params.id);
    return sendSuccess(res, { message: "Payment Deleted Successfully", data: {} });
  }
}

export default new PaymentController();
