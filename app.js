import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import SequelizeStoreInit from "connect-session-sequelize";

dotenv.config();

import { sequelize } from "./api/models/index.js";
import authRoutes from "./api/routes/authRoutes.js";
import eventRoutes from "./api/routes/eventRoutes.js";
import "./api/cron/calendarCron.js";

const app = express();
const port = process.env.PORT || 3333;
const env = process.env.NODE_ENV || "local";

// -------------------- CORS --------------------
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://victorious-pebble-0944a0f00.3.azurestaticapps.net",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

// -------------------- SESSION STORE (SEQUELIZE) --------------------
const SequelizeStore = SequelizeStoreInit(session.Store);

// Use the SAME Sequelize instance using SSL
const sessionStore = new SequelizeStore({
  db: sequelize,
});

// -------------------- EXPRESS SESSION --------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: env !== "local",
      httpOnly: true,
      sameSite: env !== "local" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// REQUIRED for Sequelize session store
sessionStore.sync();

// -------------------- PASSPORT --------------------
app.use(passport.initialize());
app.use(passport.session());

// -------------------- ROUTES --------------------
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);

// -------------------- ROOT --------------------
app.get("/", (req, res) => {
  res.send("Backend API running");
});

// -------------------- START SERVER --------------------
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("Database connected with SSL");
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
