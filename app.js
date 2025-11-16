// app.js
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import dotenv from 'dotenv';
import { sequelize } from './api/models/index.js'; // make sure you export sequelize correctly
import authRoutes from './api/routes/authRoutes.js';
import eventRoutes from "./api/routes/eventRoutes.js";
import "./api/cron/calendarCron.js";



dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

// Middleware
app.use(express.json()); // replaces body-parser

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Session middleware for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret123',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use("/events", eventRoutes);

// Optional: test route
app.get('/', (req, res) => {
  res.send('Server running');
});

// Sync database and start server
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database tables created or updated!');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
