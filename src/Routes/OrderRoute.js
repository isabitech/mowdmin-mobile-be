import { Router } from "express";
import OrderController from "../Controllers/OrderController.js";
import { validateOrder } from "../middleware/Validation/orderValidation.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const Order = Router();

//  Create a new order
Order.post("/", protectUser, validateOrder, tryCatch(OrderController.create));

//  Get all orders (admin)
Order.get("/", protectUser, tryCatch(OrderController.getAll));

//  Get all orders for a single user
Order.get("/user/:userId", protectUser, tryCatch(OrderController.getUserOrders));

//  Get a single order by ID
Order.get("/:id", protectUser, tryCatch(OrderController.getOne));

//  Update order
Order.put("/:id", protectUser, validateOrder, tryCatch(OrderController.update));

//  Delete order
Order.delete("/:id", protectUser, tryCatch(OrderController.delete));

export default Order;
