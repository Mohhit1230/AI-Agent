import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.HOST_EMAIL,
    pass: process.env.HOST_PASSWORD,
  },
});

// Email templates
const emailTemplates = {
  otp: (name, otp) => ({
    subject: "🔐 Your Verification Code - Prosperity Agent",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0f1115 0%, #1a1d23 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" style="max-width: 520px; background: linear-gradient(145deg, rgba(30, 33, 40, 0.95), rgba(20, 22, 28, 0.98)); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(180deg, rgba(6, 182, 212, 0.15) 0%, transparent 100%);">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(6, 182, 212, 0.4);">
               <img src="https://ai-agent-mocha-pi.vercel.app/favicon1.png" style="width: 40px; height: 40px;" />
              </div>
              <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Verification Code</h1>
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Prosperity Agent</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px 40px;">
              <p style="margin: 0 0 24px; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
                Hey <strong style="color: #06B6D4;">${name}</strong>! 👋
              </p>
              <p style="margin: 0 0 32px; color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.6;">
                Use this code to verify your account. It'll expire in <strong style="color: #fff;">10 minutes</strong>.
              </p>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.15)); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 32px;">
                <p style="margin: 0 0 12px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #06B6D4; font-family: 'Courier New', monospace; text-shadow: 0 0 30px rgba(6, 182, 212, 0.5);">
                  ${otp}
                </div>
              </div>
              
              <!-- Warning -->
              <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #EF4444; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.5;">
                  ⚠️ <strong>Security tip:</strong> Never share this code with anyone. We'll never ask for it.
                </p>
              </div>
              
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 13px; text-align: center;">
                Didn't request this? Just ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Prosperity Agent • Powered by AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  resetPassword: (name, otp) => ({
    subject: "🔑 Reset Your Password - Prosperity Agent",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0f1115 0%, #1a1d23 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" style="max-width: 520px; background: linear-gradient(145deg, rgba(30, 33, 40, 0.95), rgba(20, 22, 28, 0.98)); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(180deg, rgba(6, 182, 212, 0.15) 0%, transparent 100%);">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(6, 182, 212, 0.4);">
                <img src="https://ai-agent-mocha-pi.vercel.app/favicon1.png" style="width: 40px; height: 40px;" />
              </div>
              <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Password Reset</h1>
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Prosperity Agent</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px 40px;">
              <p style="margin: 0 0 24px; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
                Hey <strong style="color: #06B6D4;">${name}</strong>! 👋
              </p>
              <p style="margin: 0 0 32px; color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.6;">
                We received a request to reset your password. Use this code within <strong style="color: #fff;">10 minutes</strong>.
              </p>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.15)); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 32px;">
                <p style="margin: 0 0 12px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Reset Code</p>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #06B6D4; font-family: 'Courier New', monospace; text-shadow: 0 0 30px rgba(6, 182, 212, 0.5);">
                  ${otp}
                </div>
              </div>
              
              <!-- Warning -->
              <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #F59E0B; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.5;">
                  🛡️ <strong>Security notice:</strong> If you didn't request this, your account may be at risk. Please secure it immediately.
                </p>
              </div>
              
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 13px; text-align: center;">
                Having trouble? Contact our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Prosperity Agent • Powered by AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  welcome: (name) => ({
    subject: "🎉 Welcome to Prosperity Agent!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0f1115 0%, #1a1d23 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" style="max-width: 520px; background: linear-gradient(145deg, rgba(30, 33, 40, 0.95), rgba(20, 22, 28, 0.98)); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);">
                <img src="https://ai-agent-mocha-pi.vercel.app/favicon1.png" style="width: 40px; height: 40px;" />
              </div>
              <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; ">Welcome Aboard!</h1>
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Prosperity Agent</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px 40px;">
              <p style="margin: 0 0 24px; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
                Hey <strong style="color: #10B981;">${name}</strong>! 🎊
              </p>
              <p style="margin: 0 0 24px; color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.6;">
                Your account is now verified and ready to go! You now have access to an AI-powered productivity suite.
              </p>
              
              <!-- Features -->
              <div style="background: rgba(16, 185, 129, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 16px; color: #10B981; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">What you can do:</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: rgba(255,255,255,0.8); font-size: 14px;">✨ AI-powered conversations</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: rgba(255,255,255,0.8); font-size: 14px;">📅 Google Calendar integration</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: rgba(255,255,255,0.8); font-size: 14px;">📝 Smart note-taking with Keep</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: rgba(255,255,255,0.8); font-size: 14px;">🌐 Browser automation</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: rgba(255,255,255,0.8); font-size: 14px;">📄 PDF generation & more!</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 13px; text-align: center;">
                Ready to boost your productivity? Let's get started!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Prosperity Agent • Powered by AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),
};

// Send email utility
export const sendEmail = async (to, template, data) => {
  try {
    const { subject, html } = emailTemplates[template](...data);

    const mailOptions = {
      from: `"Prosperity Agent" <${process.env.HOST_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("📧 Email service ready");
  }
});

export default transporter;
