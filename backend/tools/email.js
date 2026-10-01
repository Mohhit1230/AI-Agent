import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// Nodemailer Stream Transport (Generates email locally without connecting to network)
const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: "windows",
});

export async function email({ to, subject, text }) {
  const mailOptions = {
    from: `"Prosmic Agent 👾" <${process.env.HOST_EMAIL}>`,
    to,
    subject,
    text,
    html: `<h3>Agent Status: ✅</h3><p>Your system is alive and kicking, bro. 🔥</p>
           <p>Message: ${text}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    const chunks = [];
    for await (const chunk of info.message) {
      chunks.push(chunk);
    }
    const messageBuffer = Buffer.concat(chunks);
    const encodedMail = messageBuffer.toString("base64")
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMail,
      },
    });

    console.log("✅ Email sent via HTTP API:", res.data.id);

    return {
      content: [
        {
          type: "text",
          text: `📬 Email sent to ${to} with subject "${subject}"`,
        },
      ],
    };
  } catch (error) {
    console.error("❌ Email failed:", error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Failed to send email: ${error.message}`,
        },
      ],
    };
  }
}