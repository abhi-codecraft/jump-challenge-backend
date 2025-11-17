// backend/routes/eventRoutes.js
import express from "express";
import {
  getUpcomingEvents,
  getPastEvents,
  getEventById
} from "../controllers/eventController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Protected routes
router.get("/upcoming", verifyToken, getUpcomingEvents);
router.get("/past", verifyToken, getPastEvents);
router.get("/:id", verifyToken, getEventById);

export default router;
