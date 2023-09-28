import express, { Router } from "express";
import userRoutes from "./user";
import groupRoutes from "./group";

const router: Router = express.Router();

// routes
router.use("/user", userRoutes);
router.use("/group", groupRoutes);

export default router;