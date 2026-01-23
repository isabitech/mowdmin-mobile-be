import { Router } from "express";
import OrderItemController from "../Controllers/OrderItemController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { validateCreateOrderItem, validateUpdateOrderItem } from "../validators/orderItemValidators.js";
import { tryCatch } from "../Utils/try-catch.js";

const orderItem = Router();

orderItem.post(
	"/",
	protectUser,
	validateCreateOrderItem,
	
	tryCatch(OrderItemController.create)
);
orderItem.get("/", protectUser, tryCatch(OrderItemController.getAll));
orderItem.get("/order/:orderId", protectUser, tryCatch(OrderItemController.getItemsByOrder));
orderItem.get("/:id", protectUser, tryCatch(OrderItemController.getOne));
orderItem.put(
	"/:id",
	protectUser,
	validateUpdateOrderItem,
	
	tryCatch(OrderItemController.update)
);
orderItem.delete("/:id", protectUser, tryCatch(OrderItemController.delete));

export default orderItem;
