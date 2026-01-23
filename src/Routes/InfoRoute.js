// InfoRoute.js
import express from "express";
import getMinistryInfo from "../Controllers/InfoController.js";

const router = express.Router();
router.get('/', getMinistryInfo);

export default router;