import { Router } from "express";
import OrderItemController from "../Controllers/OrderItemController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { middlewareValidateCreateOrderItem, middlewareValidateUpdateOrderItem } from "../middleware/Validation/orderItemValidation.js";
import { tryCatch } from "../Utils/try-catch.js";

const orderItem = Router();

orderItem.post(
	"/create",
	protectUser,
	protectAdmin, // Admin only - usually created via Order
	middlewareValidateCreateOrderItem,
	tryCatch(OrderItemController.create)
);
orderItem.get("/", protectUser, protectAdmin, tryCatch(OrderItemController.getAll));
orderItem.get("/order/:orderId", protectUser, tryCatch(OrderItemController.getItemsByOrder)); // Users need to see their items
orderItem.get("/:id", protectUser, tryCatch(OrderItemController.getOne)); // Users need to see detail
orderItem.put(
	"/:id",
	protectUser,
	protectAdmin, // Admin only
	middlewareValidateUpdateOrderItem,
	tryCatch(OrderItemController.update)
);
orderItem.delete("/:id", protectUser, protectAdmin, tryCatch(OrderItemController.delete)); // Admin only

export default orderItem;
