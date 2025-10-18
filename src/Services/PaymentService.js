// services/PaymentService.js
import Payment from "../Models/PaymentModel.js";
import Order from "../Models/OrderModel.js";
import User from "../Models/UserModel.js";

class PaymentService {
    // Initialize a new payment record
    async createPayment(data) {
        return await Payment.create(data);
    }

    // Fetch all payments (admin/global)
    async getAllPayments() {
        return await Payment.findAll({
            include: [
                { model: Order, as: "order", attributes: ["id", "status", "total_amount"] },
                { model: User, as: "user", attributes: ["id", "name", "email"] },
            ],
            order: [["createdAt", "DESC"]],
        });
    }

    // Fetch all payments by user
    async getPaymentsByUser(userId) {
        return await Payment.findAll({
            where: { userId },
            include: [{ model: Order, as: "order" }],
            order: [["createdAt", "DESC"]],
        });
    }

    // Fetch single payment
    async getPaymentById(id) {
        return await Payment.findByPk(id, {
            include: [
                { model: Order, as: "order" },
                { model: User, as: "user" },
            ],
        });
    }

    // Update payment details
    async updatePayment(id, data) {
        const payment = await Payment.findByPk(id);
        if (!payment) return null;

        return await payment.update(data);
    }

    // Delete payment record
    async deletePayment(id) {
        const payment = await Payment.findByPk(id);
        if (!payment) return null;

        await payment.destroy();
        return { message: "Payment record deleted successfully" };
    }

    // Mark payment as successful
    async markAsSuccessful(reference) {
        const payment = await Payment.findOne({ where: { reference } });
        if (!payment) return null;

        payment.status = "successful";
        await payment.save();

        // Optionally update related order
        const order = await Order.findByPk(payment.orderId);
        if (order) {
            order.status = "paid";
            await order.save();
        }

        return payment;
    }

    // Mark payment as failed
    async markAsFailed(reference) {
        const payment = await Payment.findOne({ where: { reference } });
        if (!payment) return null;

        payment.status = "failed";
        await payment.save();

        return payment;
    }
}

export default new PaymentService();
