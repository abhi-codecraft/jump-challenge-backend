import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const CalendarEvent = sequelize.define(
  "CalendarEvent",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    google_event_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    attendees: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    status: {
      type: DataTypes.ENUM("upcoming", "past", "cancelled"),
      allowNull: false,
      defaultValue: "upcoming",
    },
    meeting_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meeting_platform: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "calendar_events",
    timestamps: true, // createdAt, updatedAt
  }
);
