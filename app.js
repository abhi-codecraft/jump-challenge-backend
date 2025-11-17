// app.js
import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import mysqlSession from "express-mysql-session";

dotenv.config();

import { sequelize } from "./api/models/index.js";
import authRoutes from "./api/routes/authRoutes.js";
import eventRoutes from "./api/routes/eventRoutes.js";
import "./api/cron/calendarCron.js";

// ---------------------- APP ----------------------
const app = express();
const port = process.env.PORT || 3333;
const env = process.env.NODE_ENV || "local";

// ---------------------- PARSERS ----------------------
app.use(express.json());

// ---------------------- CORS (Azure Compatible) ----------------------
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

// ---------------------- SESSION STORE ----------------------
const MySQLStore = mysqlSession(session);

let sessionStoreOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

// Use SSL ONLY in production
if (env !== "local") {
  const sslCertPath = path.resolve("api/config/fullchain.pem");
  sessionStoreOptions.ssl = {
    require: true,
    ca: fs.readFileSync(sslCertPath),
  };
}

const sessionStore = new MySQLStore(sessionStoreOptions);

// ---------------------- SESSION CONFIG ----------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret123",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: env !== "local",                         // HTTPS-only in production
      httpOnly: true,
      sameSite: env !== "local" ? "none" : "lax",      // Azure fix
      maxAge: 24 * 60 * 60 * 1000                      // 1 day
    }
  })
);

// ---------------------- PASSPORT ----------------------
app.use(passport.initialize());
app.use(passport.session());

// ---------------------- ROUTES ----------------------
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);

// ---------------------- TEST ROUTE ----------------------
app.get("/", (req, res) => {
  res.send("Backend API running");
});

// ---------------------- START SERVER ----------------------
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("Database synced");
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server started on http://localhost:${port}`);
    });
  })
  .catch((err) => console.error("DB connection failed:", err));
