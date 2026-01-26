import { Router } from "express";
import ProductController from "../Controllers/ProductController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { middlewareValidateCreateProduct, middlewareValidateUpdateProduct } from "../validators/productValidators.js";
import { tryCatch } from "../Utils/try-catch.js";

const product = Router();

product.post(
	"/create",
	protectUser,
	middlewareValidateCreateProduct,

	tryCatch(ProductController.create)
);
product.get("/", protectUser, tryCatch(ProductController.getAll));
product.get("/category/:categoryId", protectUser, tryCatch(ProductController.getByCategory));
product.get("/:id", protectUser, tryCatch(ProductController.getOne));
product.put(
	"/:id",
	protectUser,
	middlewareValidateUpdateProduct,

	tryCatch(ProductController.update)
);
product.delete("/:id", protectUser, tryCatch(ProductController.delete));

export default product;
