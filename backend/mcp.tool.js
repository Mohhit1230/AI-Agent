import { config } from "dotenv";
import { TwitterApi } from "twitter-api-v2";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
config();

//Twitter Setup
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

export async function createPost(status) {
  const newPost = await twitterClient.v2.tweet(status);

  return {
    content: [
      {
        type: "text",
        text: `Tweeted: ${status}`,
      },
    ],
  };
}

//Mail Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.HOST_EMAIL,
    pass: process.env.HOST_PASSWORD,
  },
});

export async function sendEmail({ to, subject, text }) {
  const mailOptions = {
    from: "MS Agent 👾",
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


//Edit PDF Setup
export async function editExistingPDF(fileBuffer, newText) {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const firstPage = pdfDoc.getPages()[0];
  firstPage.drawText(newText, {
    x: 50,
    y: 700,
    size: 18,
    font,
    color: rgb(0.2, 0.8, 0.2),
  });

  return await pdfDoc.save();
}


//GoDaddy Login
export async function godaddy_login() {
  return new Promise((resolve, reject) => {
    const pyProcess = spawn("python", ["Python/Moodle.py"], {
      stdio: ["inherit", "pipe", "pipe"],
    });

    pyProcess.stdout.on("data", (data) => {
      console.log("Python stdout:", data.toString());
    });

    pyProcess.stderr.on("data", (data) => {
      console.error("Python stderr:", data.toString());
    });

    pyProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
      resolve({
        content: [
          {
            type: "text",
            text: `✅ GoDaddy script finished with exit code ${code}`,
          },
        ],
      });
    });

    pyProcess.on("error", (err) => {
      console.error("Failed to start Python script:", err);
      reject(new Error("Failed to execute Python script"));
    });
  });
}

//PDF Generation
export function generatePDF(content) {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const scriptPath = path.join(__dirname, "Python", "pdf.py");

    const pyProcess = spawn("python", [scriptPath, content]);

    let output = "";
    let errorOutput = "";

    pyProcess.stdout.on("data", (data) => (output += data.toString()));
    pyProcess.stderr.on("data", (err) => (errorOutput += err.toString()));

    pyProcess.on("close", () => {
      if (errorOutput) {
        console.error("Python error:", errorOutput);
        return reject(new Error(errorOutput));
      }

      try {
        const jsonData = JSON.parse(output);
        console.log("PDF generated:", jsonData.name);

        resolve({
          content: [
            {
              type: "resource_link", 
              uri: jsonData.pdf_uri,
              name: jsonData.name,
              mimeType: "application/pdf",
              description: "Generated PDF from text input",
            },
          ],
        });
      } catch (err) {
        console.error("JSON parse error in MCP tool:", err);
        resolve({
          content: [
            {
              type: "text",
              text: "❌ Failed to parse PDF generation output",
            },
          ],
        });
      }
    });
  });
}