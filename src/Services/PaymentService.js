import { PaymentRepository } from "../repositories/PaymentRepository.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
class PaymentService {
    async getModels() {
        let Order, User;
        if (process.env.DB_CONNECTION !== 'mongodb') {
            Order = (await import("../Models/OrderModel.js")).default;
            User = (await import("../Models/UserModel.js")).default;
        } else {
            Order = (await import("../MongoModels/OrderMongoModel.js")).default;
            User = (await import("../MongoModels/UserMongoModel.js")).default;
        }
        return { Order, User };
    }


    // Initialize a new payment record
    async createPayment(data) {
        return PaymentRepository.create(data);
    }

    // Fetch all payments (admin/global)
    async getAllPayments() {
        const { Order, User } = await this.getModels();
        return PaymentRepository.findAll({
            include: [
                { model: Order, as: "order", attributes: ["id", "status", "total_amount"] },
                { model: User, as: "user", attributes: ["id", "name", "email"] },
            ],
            order: [["createdAt", "DESC"]],
        });
    }

    // Fetch all payments by user
    async getPaymentsByUser(userId) {
        const { Order } = await this.getModels();
        return PaymentRepository.findAll({
            where: { userId },
            include: [{ model: Order, as: "order" }],
            order: [["createdAt", "DESC"]],
        });
    }

    // Fetch single payment
    async getPaymentById(id) {
        const { Order, User } = await this.getModels();
        return PaymentRepository.findById(id, {
            include: [
                { model: Order, as: "order" },
                { model: User, as: "user" },
            ],
        });
    }

    // Update payment details
    async updatePayment(id, data) {
        const payment = await PaymentRepository.findById(id);
        if (!payment) return null;

        return await payment.update(data);
    }

    // Delete payment record
    async deletePayment(id) {
        const deleted = await PaymentRepository.deleteById(id);
        if (!deleted) return null;

        return { message: "Payment record deleted successfully" };
    }

    // Mark payment as successful
    async markAsSuccessful(reference) {
        const payment = await PaymentRepository.findOne({ where: { reference } });
        if (!payment) return null;

        payment.status = "successful";
        await payment.save();

        // Optionally update related order
        const order = await OrderRepository.findById(payment.orderId);
        if (order) {
            order.status = "paid";
            await order.save();
        }

        return payment;
    }

    // Mark payment as failed
    async markAsFailed(reference) {
        const payment = await PaymentRepository.findOne({ where: { reference } });
        if (!payment) return null;

        payment.status = "failed";
        await payment.save();

        return payment;
    }
}

export default new PaymentService();
