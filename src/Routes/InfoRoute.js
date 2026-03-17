// InfoRoute.js
import express from "express";
import getMinistryInfo from "../Controllers/InfoController.js";
import { tryCatch } from "../Utils/try-catch.js";

const router = express.Router();
router.get("/", tryCatch(getMinistryInfo));

export default router;
