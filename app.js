import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import dotenv from 'dotenv';
import { sequelize } from './api/models/index.js';
import authRoutes from './api/routes/authRoutes.js';
import eventRoutes from "./api/routes/eventRoutes.js";
import "./api/cron/calendarCron.js";
import MySQLStore from 'express-mysql-session';

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

// -------------------- CORS --------------------
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://victorious-pebble-0944a0f00.3.azurestaticapps.net'
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Vary', 'Origin');  // IMPORTANT for Azure!
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// -------------------- SESSION STORE (IMPORTANT) --------------------
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// -------------------- SESSION CONFIG --------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "live",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "live" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// -------------------- PASSPORT --------------------
app.use(passport.initialize());
app.use(passport.session());

// -------------------- ROUTES --------------------
app.use('/auth', authRoutes);
app.use("/events", eventRoutes);

// -------------------- TEST ROUTE --------------------
app.get('/', (req, res) => {
  res.send('Server running');
});

// -------------------- START SERVER --------------------
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database tables created or updated!');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
