import express from "express";
import {
  getUpcomingEvents,
  getPastEvents,
  getEventById
} from "../controllers/eventController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.get("/upcoming", isAuthenticated, getUpcomingEvents);
router.get("/past", isAuthenticated, getPastEvents);
router.get("/:id", isAuthenticated, getEventById);

export default router;
