// services/OrderService.js
import { OrderRepository } from "../repositories/OrderRepository.js";

class OrderService {
  async getModels() {
    let User;
    if (process.env.DB_CONNECTION !== "mongodb") {
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
  async getAllOrders(pagination = {}) {
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
      ...pagination,
    });
  }

  // Fetch all orders for a single user
  async getOrdersByUser(userId, pagination = {}) {
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
      ...pagination,
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
    return OrderRepository.updateById(id, data);
  }

  // Delete an order
  async deleteOrder(id) {
    const deleted = await OrderRepository.deleteById(id);
    if (!deleted) return null;

    return { message: "Order deleted successfully" };
  }

  // Mark order as paid
  async markAsPaid(id, payment_reference) {
    return OrderRepository.updateById(id, {
      status: "paid",
      payment_reference,
    });
  }

  // Cancel an order
  async cancelOrder(id) {
    return OrderRepository.updateById(id, { status: "cancelled" });
  }
}

export default new OrderService();
