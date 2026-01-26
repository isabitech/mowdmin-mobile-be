import { Router } from "express";
import OrderController from "../Controllers/OrderController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { middlewareValidateCreateOrder, middlewareValidateUpdateOrder } from "../validators/orderValidators.js";
import { tryCatch } from "../Utils/try-catch.js";


const order = Router();

order.post(
	"/create",
	protectUser,
	middlewareValidateCreateOrder,
	tryCatch(OrderController.create)
);
order.get("/", protectUser, tryCatch(OrderController.getAll));
order.get("/user", protectUser, tryCatch(OrderController.getUserOrders));
order.get("/:id", protectUser, tryCatch(OrderController.getOne));
order.put(
	"/:id",
	protectUser,
	middlewareValidateUpdateOrder,
	tryCatch(OrderController.update)
);
order.delete("/:id", protectUser, tryCatch(OrderController.delete));

export default order;
