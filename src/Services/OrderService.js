// services/OrderService.js
import { OrderRepository } from "../repositories/OrderRepository.js";

class OrderService {
    async getModels() {
        let User;
        if (process.env.DB_CONNECTION !== 'mongodb') {
            User = (await import("../Models/UserModel.js")).default;
        } else {
            User = (await import("../MongoModels/UserMongoModel.js")).default;
        }
        return { User };
    }

    // Create a new order
    async createOrder(data) {
        return OrderRepository.create(data);
    }

    // Fetch all orders (admin/global view)
    async getAllOrders() {
        const { User } = await this.getModels();
        return OrderRepository.findAll({
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
    }

    // Fetch all orders for a single user
    async getOrdersByUser(userId) {
        const { User } = await this.getModels();
        return OrderRepository.findAllByUserId(userId, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
    }

    // Fetch a single order by ID
    async getOrderById(id) {
        const { User } = await this.getModels();
        return OrderRepository.findById(id, {
            include: [{ model: User, as: "user" }],
        });
    }

    // Update order details
    async updateOrder(id, data) {
        const order = await OrderRepository.findById(id);
        if (!order) return null;

        return await order.update(data);
    }

    // Delete an order
    async deleteOrder(id) {
        const deleted = await OrderRepository.deleteById(id);
        if (!deleted) return null;

        return { message: "Order deleted successfully" };
    }

    // Mark order as paid
    async markAsPaid(id, payment_reference) {
        const order = await OrderRepository.findById(id);
        if (!order) return null;

        order.status = "paid";
        order.payment_reference = payment_reference;
        await order.save();

        return order;
    }

    // Cancel an order
    async cancelOrder(id) {
        const order = await OrderRepository.findById(id);
        if (!order) return null;

        order.status = "cancelled";
        await order.save();

        return order;
    }
}

export default new OrderService();
