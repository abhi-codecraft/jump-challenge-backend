import express from "express";
import {
  getUpcomingEvents,
  getPastEvents,
  getEventById
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/upcoming", getUpcomingEvents);
router.get("/past", getPastEvents);
router.get("/:id", getEventById);

export default router;
