import { google } from "googleapis";
import { config } from "dotenv";
config();

// Google Calendar Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // Default for easy setup
);

if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const calendar = google.calendar({ version: "v3", auth: oauth2Client });


export async function list_events(maxResults = 10) {
  try {
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
      return { content: [{ type: "text", text: "No upcoming events found." }] };
    }
    const eventList = events
      .map((event) => {
        const start = event.start.dateTime || event.start.date;
        return `${start} - ${event.summary}`;
      })
      .join("\n");
    return {
      content: [{ type: "text", text: `Upcoming events:\n${eventList}` }],
    };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `❌ Error listing events: ${error.message}` },
      ],
    };
  }
}

export async function add_event(
  summary,
  description,
  startTime,
  endTime,
  location = ""
) {
  const event = {
    summary,
    location,
    description,
    start: { dateTime: startTime },
    end: { dateTime: endTime },
  };
  try {
    const res = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    return {
      content: [{ type: "text", text: `Event created: ${res.data.htmlLink}` }],
    };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `❌ Error creating event: ${error.message}` },
      ],
    };
  }
}

export async function view_day(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
      return {
        content: [{ type: "text", text: `No events found for ${date}.` }],
      };
    }
    const eventList = events
      .map((event) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        return `${new Date(start).toLocaleTimeString()} - ${new Date(
          end
        ).toLocaleTimeString()}: ${event.summary}`;
      })
      .join("\n");
    return {
      content: [{ type: "text", text: `Schedule for ${date}:\n${eventList}` }],
    };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `❌ Error viewing day: ${error.message}` },
      ],
    };
  }
}