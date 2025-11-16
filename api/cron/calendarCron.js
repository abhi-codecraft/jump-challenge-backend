import cron from "node-cron";
import { google } from "googleapis";
import dayjs from "dayjs";
import { User } from "../models/User.js";
import { CalendarEvent } from "../models/CalendarEvent.js";

// Build OAuth client for a user
const getOAuthClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );

  oauth2Client.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
  });

  return oauth2Client;
};

// Main cron logic
cron.schedule("*/5 * * * *", async () => {
  console.log("🔄 Running Google Calendar sync...");

  try {
    const users = await User.findAll();

    for (const user of users) {
      console.log(`Syncing events for user: ${user.email}`);

      const oauth2Client = getOAuthClient(user);
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 50,
      });

      const events = response.data.items || [];

      for (const event of events) {
        const googleId = event.id;
        const start = event.start?.dateTime || event.start?.date;
        const end = event.end?.dateTime || event.end?.date;

        // Determine status
        let status = "upcoming";
        if (dayjs(end).isBefore(dayjs())) status = "past";
        if (event.status === "cancelled") status = "cancelled";

        await CalendarEvent.upsert({
          google_event_id: googleId,
          user_id: user.id,
          title: event.summary || "Untitled Meeting",
          description: event.description || "",
          start_time: start,
          end_time: end,
          attendees: event.attendees || [],
          status,
        });
      }
    }

    console.log("✅ Calendar sync complete.");
  } catch (err) {
    console.error("❌ Cron sync error:", err.message);
  }
});
