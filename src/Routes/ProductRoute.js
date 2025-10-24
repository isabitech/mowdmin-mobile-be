import express from "express";
import ProductController from "../Controllers/ProductController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import {validateProductCreate, validateProductUpdate} from "../middleware/Validation/ProductValidation.js";
import { tryCatch } from "../Utils/try-catch.js";


const Product = express.Router();

Product.post("/", protectUser, validateProductCreate, tryCatch(ProductController.create));
Product.get("/", tryCatch(ProductController.getAll));
Product.get("/:id", tryCatch(ProductController.getOne));
Product.get("/category/:categoryId", tryCatch(ProductController.getByCategory));
Product.put("/:id", protectUser,validateProductUpdate, tryCatch(ProductController.update));
Product.delete("/:id", protectUser, tryCatch(ProductController.delete));

export default Product;
