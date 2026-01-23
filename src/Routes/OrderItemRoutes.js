import { Router } from "express";
import OrderItemController from "../Controllers/OrderItemController.js";
import { validateOrderItem } from "../middleware/Validation/orderItemValidation.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const OrderItem = Router();

//  Add item to order
OrderItem.post("/", protectUser, validateOrderItem, tryCatch(OrderItemController.create));

//  Get all order items (admin)
OrderItem.get("/", protectUser, tryCatch(OrderItemController.getAll));

//  Get order items by orderId
OrderItem.get("/order/:orderId", protectUser, tryCatch(OrderItemController.getItemsByOrder));

//  Get a single order item
OrderItem.get("/:id", protectUser,tryCatch( OrderItemController.getOne));

//  Update an order item
OrderItem.put("/:id", protectUser, validateOrderItem,tryCatch( OrderItemController.update));

//  Delete an order item
OrderItem.delete("/:id", protectUser,tryCatch( OrderItemController.delete));

export default OrderItem;
