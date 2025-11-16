import cron from "node-cron";
import { google } from "googleapis";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import axios from "axios";

dayjs.extend(utc);

import { User } from "../models/User.js";
import { CalendarEvent } from "../models/CalendarEvent.js";

/* ------------------------------------------------------------
   Extract Meeting URL + Platform
------------------------------------------------------------ */
const extractMeetingInfo = (event) => {
  const text = `
    ${event.location || ""}
    ${event.description || ""}
    ${JSON.stringify(event.conferenceData || {})}
  `.toLowerCase();

  const patterns = [
    { platform: "google_meet", regex: /https:\/\/meet\.google\.com\/[a-z0-9-]+/i },
    { platform: "zoom", regex: /https:\/\/zoom\.us\/j\/[0-9]+/i },
    { platform: "teams", regex: /https:\/\/([^ ]+)?teams\.microsoft\.com\/[^\s]+/i },
    { platform: "webex", regex: /https:\/\/.*webex\.com\/[^\s]+/i },
  ];

  for (const p of patterns) {
    const m = text.match(p.regex);
    if (m) {
      return {
        meeting_url: m[0],
        meeting_platform: p.platform,
      };
    }
  }

  return null; // no valid meeting URL found
};

/* ------------------------------------------------------------
   OAuth Client for Google Calendar
------------------------------------------------------------ */
const getOAuthClient = (user) => {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );

  oauth2.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
  });

  return oauth2;
};

/* ------------------------------------------------------------
   Google Server Time (official)
------------------------------------------------------------ */
async function getGoogleServerTime() {
  const res = await axios.get("https://www.google.com/generate_204");
  return dayjs(res.headers.date); // Google server time in UTC
}

/* ------------------------------------------------------------
   CRON JOB — every 1 minute
------------------------------------------------------------ */
cron.schedule("*/1 * * * *", async () => {
  console.log("\n🔄 Running Google Calendar sync...");

  try {
    const users = await User.findAll();

    for (const user of users) {
      console.log(`\n➡ Syncing events for: ${user.email}`);

      const oauth2Client = getOAuthClient(user);
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      // Fetch events for next 7 days
      const response = await calendar.events.list({
        calendarId: "primary",
        singleEvents: true,
        orderBy: "startTime",
        timeMin: dayjs().startOf("day").toISOString(),
        timeMax: dayjs().add(7, "day").endOf("day").toISOString(),
        maxResults: 100,
      });

      const events = response.data.items || [];
      console.log(`📅 Google returned ${events.length} events`);

      // Get accurate Google server time
      const googleNow = await getGoogleServerTime();
      console.log("Google Server Time:", googleNow.format());

      /* ------------------------------------------------------------
         Process Events
      ------------------------------------------------------------ */
      for (const event of events) {
        const googleId = event.id;
        if (!googleId) continue;
        if (event.status === "cancelled") continue;
        if (!event.start?.dateTime) continue; // ignore all-day events
        if (!event.summary || !event.summary.trim()) continue;

        // Detect meeting link + platform
        const info = extractMeetingInfo(event);
        console.log(info);
        if (!info) {
          console.log(`🚫 Skipping NON-MEETING event: ${event.summary}`);
          continue;
        }

        const { meeting_url, meeting_platform } = info;

        const startRaw = event.start.dateTime;
        const endRaw = event.end.dateTime;

        const eventEnd = dayjs(endRaw);
        const now = googleNow;

        const status = eventEnd.isBefore(now) ? "past" : "upcoming";

        console.log(`✔ Upserting: ${event.summary} (${status})`);
        console.log("Platform:", meeting_platform, "| URL:", meeting_url);

        await CalendarEvent.upsert({
          google_event_id: googleId,
          user_id: user.id,
          title: event.summary,
          description: event.description || "",
          start_time: startRaw,
          end_time: endRaw,
          attendees: event.attendees || [],
          meeting_link: meeting_url,
          meeting_platform: meeting_platform,
          status,
        });
      }

      /* ------------------------------------------------------------
         Recalculate status for stored events
      ------------------------------------------------------------ */
      console.log("🔁 Updating stored event statuses...");

      const savedEvents = await CalendarEvent.findAll({
        where: { user_id: user.id },
      });

      for (const ev of savedEvents) {
        const newStatus = dayjs(ev.end_time).isBefore(await getGoogleServerTime())
          ? "past"
          : "upcoming";

        if (ev.status !== newStatus) {
          console.log(`🔄 Status changed: ${ev.title} → ${newStatus}`);
          await ev.update({ status: newStatus });
        }
      }
    }

    console.log("\n✅ Calendar sync completed.");
  } catch (err) {
    console.error("❌ Cron sync error:", err.response?.data || err.message);
  }
});
