import { CalendarEvent } from "../models/CalendarEvent.js";
import dayjs from "dayjs";

export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.findAll({
      where: {
        user_id: req.user.id,
        status: "upcoming"
      },
      order: [["start_time", "ASC"]],
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching upcoming events" });
  }
};

export const getPastEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.findAll({
      where: {
        user_id: req.user.id,
        status: "past"
      },
      order: [["start_time", "DESC"]],
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching past events" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event" });
  }
};
