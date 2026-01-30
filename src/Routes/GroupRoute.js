import { Router } from "express";
import GroupController from "../Controllers/GroupController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import { tryCatch } from "../Utils/try-catch.js";

const group = Router();

group.post("/create", protectUser, tryCatch(GroupController.createGroup));
group.get("/me", protectUser, tryCatch(GroupController.getMyGroups));
group.get("/discover", protectUser, tryCatch(GroupController.getDiscoverGroups));
group.get("/:id", protectUser, tryCatch(GroupController.getGroupDetails));
group.post("/:id/join", protectUser, tryCatch(GroupController.joinGroup));
group.get("/:id/messages", protectUser, tryCatch(GroupController.getGroupMessages));
group.post("/:id/messages", protectUser, tryCatch(GroupController.sendMessage));

export default group;
