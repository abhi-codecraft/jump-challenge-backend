// backend/routes/authRoutes.js
import express from "express";
import passport from "passport";
import { googleStrategySetup, getCurrentUser, logoutUser } from "../controllers/authController.js";

// Initialize Google strategy
googleStrategySetup();

const router = express.Router();

// Routes
router.get("/google", passport.authenticate("google"));
router.get("/me", getCurrentUser);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Redirect to frontend dashboard after successful login
    res.redirect("http://localhost:5173");
  }
);

router.post("/logout", logoutUser);


export default router;
