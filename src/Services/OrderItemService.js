// services/OrderItemService.js
import { OrderRepository } from "../repositories/OrderRepository.js";
import { OrderItemRepository } from "../repositories/OrderItemRepository.js";

class OrderItemService {
    // Add item(s) to an order
    async addItem(data) {
        return await OrderItemRepository.create(data);
    }

    // Get all items for a specific order
    async getItemsByOrder(orderId) {
        return await OrderItemRepository.findAllByOrderId(orderId, {
            include: [
                {
                    model: Order,
                    as: "order",
                    attributes: ["id", "status", "total_amount"],
                },
            ],
            order: [["createdAt", "ASC"]],
        });
    }

    // Get a single item by ID
    async getItemById(id) {
        return await OrderItemRepository.findById(id, {
            include: [{ model: Order, as: "order" }],
        });
    }

    // Update an order item
    async updateItem(id, data) {
        const item = await OrderItemRepository.findById(id);
        if (!item) return null;

        return await item.update(data);
    }

    // Delete an order item
    async deleteItem(id) {
        const item = await OrderItemRepository.findById(id);
        if (!item) return null;

        await item.destroy();
        return { message: "Order item deleted successfully" };
    }

    // Get total cost for all items in an order
    async calculateOrderTotal(orderId) {
        const items = await OrderItemRepository.findAllByOrderId(orderId);
        const total = items.reduce(
            (sum, item) => sum + parseFloat(item.subtotal),
            0
        );
        return total.toFixed(2);
    }
}

export default new OrderItemService();
