import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";

// Force IPv4 for Render (fixes ETIMEDOUT issues)
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

//Mail Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.HOST_EMAIL,
    pass: process.env.HOST_PASSWORD,
  },
});




export async function email({ to, subject, text }) {
  const mailOptions = {
    from: "Prosmic Agent 👾",
    to,
    subject,
    text,
    html: `<h3>Agent Status: ✅</h3><p>Your system is alive and kicking, bro. 🔥</p>
           <p>Message: ${text}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

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