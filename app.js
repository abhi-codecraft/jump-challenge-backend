// app.js
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import axios from "axios";

// Load ENV
dotenv.config();

import { sequelize } from './api/models/index.js';
import authRoutes from './api/routes/authRoutes.js';
import eventRoutes from "./api/routes/eventRoutes.js";
import "./api/cron/calendarCron.js";

// -------------------- FIX: express-mysql-session in ESM --------------------
import mysqlSession from 'express-mysql-session';
const MySQLStore = mysqlSession(session);

// -------------------- CREATE APP --------------------
const app = express();
const port = process.env.PORT || 3333;

// -------------------- PARSER --------------------
app.use(express.json());

// -------------------- CORS (IMPORTANT FOR AZURE SESSIONS) --------------------
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://victorious-pebble-0944a0f00.3.azurestaticapps.net"
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

// -------------------- SESSION STORE --------------------
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// -------------------- EXPRESS SESSION --------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",   // HTTPS only in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// -------------------- PASSPORT INIT --------------------
app.use(passport.initialize());
app.use(passport.session());

// -------------------- ROUTES --------------------
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);

// -------------------- DEFAULT ROUTE --------------------
app.get("/", (req, res) => {
  res.send("Backend API running");
});

// -------------------- START SERVER --------------------
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("Database synced!");
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch(err => console.error("DB connection error:", err));
