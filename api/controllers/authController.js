// backend/controllers/authController.js
import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

// ---------------- Google Strategy ----------------
export const googleStrategySetup = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_REDIRECT_URL,
                scope: [
                    "profile",
                    "email",
                    "https://www.googleapis.com/auth/calendar.readonly",
                    "https://www.googleapis.com/auth/calendar.events.readonly",
                ],
                accessType: "offline",
                prompt: "consent",
            },

            async (accessToken, refreshToken, profile, done) => {
                try {
                    const { email, name, picture } = profile._json;

                    // Create or update user
                    const [user] = await User.findOrCreate({
                        where: { email },
                        defaults: {
                            name,
                            picture,
                            google_access_token: accessToken,
                            google_refresh_token: refreshToken,
                        },
                    });

                    // Update tokens if returning user
                    await user.update({
                        google_access_token: accessToken,
                        google_refresh_token: refreshToken,
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
};

// ---------------- Generate JWT ----------------
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// ---------------- Handle Google Callback → Return JWT ----------------
export const googleCallback = (req, res) => {
    const token = generateToken(req.user);

    // Redirect frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/login?token=${token}`;

    return res.redirect(redirectUrl);
};

// ---------------- Get Current User via JWT ----------------
export const getCurrentUser = async (req, res) => {
    try {
        res.json({
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            picture: req.user.picture,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// ---------------- Logout (Frontend handles token deletion) ----------------
export const logoutUser = async (req, res) => {
    res.json({ message: "Logged out (client must delete token)" });
};
