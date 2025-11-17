// backend/routes/authRoutes.js
import express from "express";
import passport from "passport";
import {
  googleStrategySetup,
  googleCallback,
  getCurrentUser,
  logoutUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

googleStrategySetup();

const router = express.Router();

// Step 1: Redirect to Google
router.get("/google", passport.authenticate("google"));

// Step 2: Google redirects here → we create JWT
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleCallback
);

// Protected route
router.get("/me", verifyToken, getCurrentUser);

// Logout
router.post("/logout", logoutUser);

export default router;
