// routes/admin.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/auth.middleware.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/admin.controller.js";

const router = express.Router();

// All routes here require admin role
router.use(protectRoute, isAdmin);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
