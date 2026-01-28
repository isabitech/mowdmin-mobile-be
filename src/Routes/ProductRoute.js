import { Router } from "express";
import ProductController from "../Controllers/ProductController.js";
import { protectAdmin, protectUser } from "../middleware/authMiddleware.js";
import { middlewareValidateCreateProduct, middlewareValidateUpdateProduct } from "../middleware/Validation/ProductValidation.js";
import { tryCatch } from "../Utils/try-catch.js";

const product = Router();

product.post(
	"/create",
	protectUser,
	protectAdmin,
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
	protectAdmin,
	tryCatch(ProductController.update)
);
product.delete("/:id", protectUser, protectAdmin, tryCatch(ProductController.delete));

export default product;
