import { config } from "dotenv";
import fs from "fs/promises";

import { exec } from "child_process";
import { promisify } from "util";


import { google } from "googleapis";
import path from "path";
import { twitterPost } from "./tools/twitterPost.js";
import { email } from "./tools/email.js";
import { editPDF } from "./tools/pdf/editPdf.js";
import { generatePdf } from "./tools/pdf/generatePdf.js";
import {
  keep_list_notes,
  keep_add_note,
  keep_update_note,
  keep_archive_note,
  keep_delete_note
} from "./tools/keep_api.js";

const execAsync = promisify(exec);
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


config();

//Twitter Setup
export function createPost(status) {
  return twitterPost(status);
}

export function sendEmail({ to, subject, text }) {
  return email({ to, subject, text });
}

//Edit PDF Setup
export function editExistingPDF(fileBuffer, newText) {
  return editPDF(fileBuffer, newText);
}

//PDF Generation
export function generatePDF(content) {
  return generatePdf(content);
}


export async function calendar_list_events(maxResults = 10) {
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

export async function calendar_add_event(
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

export async function calendar_view_day(date) {
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

// Google Keep Tools
export function keepListNotes() {
  return keep_list_notes();
}

export function keepAddNote(title, text) {
  return keep_add_note(title, text);
}

export function keepUpdateNote(id, title, text) {
  return keep_update_note(id, title, text);
}

export function keepArchiveNote(id, archive) {
  return keep_archive_note(id, archive);
}

export function keepDeleteNote(id, delete_note) {
  return keep_delete_note(id, delete_note);
}

// Local File System Reader/Writer
export async function read_project_file(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return {
      content: [
        {
          type: "text",
          text: `File content of ${filePath}:\n\n${data}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error reading file ${filePath}: ${error.message}`,
        },
      ],
    };
  }
}

export async function update_code_snippet(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, "utf-8");
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully updated file: ${filePath}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error updating file ${filePath}: ${error.message}`,
        },
      ],
    };
  }
}

export async function list_project_files(dirPath) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const fileList = files
      .map((f) => `${f.isDirectory() ? "📁" : "📄"} ${f.name}`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `Files in ${dirPath}:\n\n${fileList}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error listing directory ${dirPath}: ${error.message}`,
        },
      ],
    };
  }
}

export async function git_check_status() {
  try {
    const { stdout, stderr } = await execAsync("git status");
    if (stderr && !stdout) {
      return {
        content: [{ type: "text", text: `❌ Git status error: ${stderr}` }],
      };
    }
    return { content: [{ type: "text", text: `Git Status:\n\n${stdout}` }] };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `❌ Git status failed: ${error.message}` },
      ],
    };
  }
}

export async function github_create_issue(owner, repo, title, body) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return {
      content: [
        {
          type: "text",
          text: "⚠️ GITHUB_TOKEN is not set in the .env file. Please add it to use GitHub tools.",
        },
      ],
    };
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to create GitHub issue: ${errorData.message}`,
          },
        ],
      };
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: `✅ GitHub issue created successfully: ${data.html_url}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error creating GitHub issue: ${error.message}`,
        },
      ],
    };
  }
}

export async function git_list_commits(count = 10) {
  try {
    const { stdout } = await execAsync(`git log -n ${count} --oneline`);
    return {
      content: [
        { type: "text", text: `Latest ${count} commits:\n\n${stdout}` },
      ],
    };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `❌ Failed to list commits: ${error.message}` },
      ],
    };
  }
}
export async function git_commit_all(message) {
  try {
    await execAsync("git add .");
    const { stdout } = await execAsync(`git commit -m "${message}"`);
    return {
      content: [{ type: "text", text: `✅ Committed changes: ${stdout}` }],
    };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `❌ Git commit failed: ${error.message}` },
      ],
    };
  }
}

export async function git_push() {
  try {
    const { stdout } = await execAsync("git push");
    return {
      content: [{ type: "text", text: `✅ Pushed changes: ${stdout}` }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `❌ Git push failed: ${error.message}` }],
    };
  }
}

export async function github_create_pull_request(
  owner,
  repo,
  title,
  body,
  head,
  base = "main"
) {
  const token = process.env.GITHUB_TOKEN;
  if (!token)
    return { content: [{ type: "text", text: "⚠️ GITHUB_TOKEN missing." }] };

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body, head, base }),
      }
    );

    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ PR failed: ${data.message}` }],
      };
    return {
      content: [{ type: "text", text: `✅ PR created: ${data.html_url}` }],
    };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}

export async function github_list_issues(owner, repo, state = "open") {
  const token = process.env.GITHUB_TOKEN;
  try {
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (token) headers["Authorization"] = `token ${token}`;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}`,
      { headers }
    );
    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ Failed: ${data.message}` }],
      };

    const issues = data
      .filter((i) => !i.pull_request)
      .map((i) => `#${i.number} ${i.title} (${i.state})`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `Issues in ${owner}/${repo}:\n\n${issues || "No issues found."
            }`,
        },
      ],
    };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}

export async function github_list_pull_requests(owner, repo, state = "open") {
  const token = process.env.GITHUB_TOKEN;
  try {
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (token) headers["Authorization"] = `token ${token}`;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}`,
      { headers }
    );
    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ Failed: ${data.message}` }],
      };

    const prs = data
      .map((p) => `#${p.number} ${p.title} (${p.state})`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `PRs in ${owner}/${repo}:\n\n${prs || "No PRs found."}`,
        },
      ],
    };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}

export async function github_get_repo_stats(owner, repo) {
  const token = process.env.GITHUB_TOKEN;
  try {
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (token) headers["Authorization"] = `token ${token}`;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ Failed: ${data.message}` }],
      };

    const stats = `Repo: ${data.full_name}\nDescription: ${data.description}\nStars: ${data.stargazers_count}\nForks: ${data.forks_count}\nLanguage: ${data.language}\nVisibility: ${data.visibility}`;
    return { content: [{ type: "text", text: stats }] };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}

export async function github_get_user_profile(username) {
  const token = process.env.GITHUB_TOKEN;
  try {
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (token) headers["Authorization"] = `token ${token}`;

    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });
    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ Failed: ${data.message}` }],
      };

    const profile = `User: ${data.login} (${data.name || "N/A"})\nBio: ${data.bio || "N/A"
      }\nPublic Repos: ${data.public_repos}\nFollowers: ${data.followers
      }\nFollowing: ${data.following}\nLocation: ${data.location || "N/A"}`;
    return { content: [{ type: "text", text: profile }] };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}
