import { Router } from "express";
import OrderController from "../Controllers/OrderController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { checkOwnership } from "../middleware/ownershipMiddleware.js";
import {
  middlewareValidateCreateOrder,
  middlewareValidateUpdateOrder,
} from "../middleware/Validation/orderValidation.js";
import { tryCatch } from "../Utils/try-catch.js";

const order = Router();

// Alias POST /orders to /orders/create for clients expecting RESTful create.
order.post(
  "/",
  protectUser,
  middlewareValidateCreateOrder,
  tryCatch(OrderController.create),
);
order.post(
  "/create",
  protectUser,
  middlewareValidateCreateOrder,
  tryCatch(OrderController.create),
);
order.get("/", protectUser, protectAdmin, tryCatch(OrderController.getAll));
order.get("/user", protectUser, tryCatch(OrderController.getUserOrders));
order.get(
  "/:id",
  protectUser,
  checkOwnership("Order"),
  tryCatch(OrderController.getOne),
);
order.put(
  "/:id",
  protectUser,
  protectAdmin,
  middlewareValidateUpdateOrder,
  tryCatch(OrderController.update),
);
order.delete(
  "/:id",
  protectUser,
  protectAdmin,
  tryCatch(OrderController.delete),
);

// Pay for an order (creates a Stripe PaymentIntent)
order.post(
  "/:id/pay",
  protectUser,
  checkOwnership("Order"),
  tryCatch(OrderController.payForOrder),
);

// Admin Cancellation
order.post(
  "/:id/cancel",
  protectUser,
  protectAdmin,
  tryCatch(OrderController.cancel),
);

export default order;
