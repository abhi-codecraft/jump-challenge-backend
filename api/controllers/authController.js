// backend/controllers/authController.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

// Google Strategy
export const googleStrategySetup = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:3000/auth/google/callback",
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
                    const [user, created] = await User.findOrCreate({
                        where: { email },
                        defaults: {
                            name,
                            picture,
                            google_access_token: accessToken,
                            google_refresh_token: refreshToken,
                        },
                    });

                    // If existing user, update tokens
                    if (!created) {
                        await user.update({
                            google_access_token: accessToken,
                            google_refresh_token: refreshToken,
                        });
                    }

                    done(null, user);
                } catch (error) {
                    console.error("Error saving Google user:", error);
                    done(error, null);
                }
            }
        )
    );

    // Serialize and deserialize
    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

export const getCurrentUser = async (req, res) => {
    try {
        // If using session with Passport
        if (!req.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        // Return user info
        res.json({
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            picture: req.user.picture,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const logoutUser = (req, res) => {
    try {
        // Passport exposes logout() to terminate the session
        req.logout(err => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ message: "Logout failed" });
            }

            // Destroy session and clear cookie
            req.session.destroy(() => {
                res.clearCookie("connect.sid"); // default session cookie name
                res.json({ message: "Logged out successfully" });
            });
        });
    } catch (err) {
        console.error("Logout exception:", err);
        res.status(500).json({ message: "Logout failed" });
    }
};

