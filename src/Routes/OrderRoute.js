import { Router } from "express";
import OrderController from "../Controllers/OrderController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import { checkOwnership } from "../middleware/ownershipMiddleware.js";
import { middlewareValidateCreateOrder, middlewareValidateUpdateOrder } from "../middleware/Validation/orderValidation.js";
import { tryCatch } from "../Utils/try-catch.js";


const order = Router();

order.post(
	"/create",
	protectUser,
	middlewareValidateCreateOrder,
	tryCatch(OrderController.create)
);
order.get("/", protectUser, protectAdmin, tryCatch(OrderController.getAll));
order.get("/user", protectUser, tryCatch(OrderController.getUserOrders));
order.get("/:id", protectUser, checkOwnership('Order'), tryCatch(OrderController.getOne));
order.put(
	"/:id",
	protectUser,
	checkOwnership('Order'),
	middlewareValidateUpdateOrder,
	tryCatch(OrderController.update)
);
order.delete("/:id", protectUser, checkOwnership('Order'), tryCatch(OrderController.delete));

export default order;
