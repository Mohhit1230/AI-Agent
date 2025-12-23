import { config } from "dotenv";
import { TwitterApi } from "twitter-api-v2";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

chromium.use(stealth());
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

// Browser Tools
let browserContext = null;
const userDataDir = path.join(process.cwd(), "browser_data");

async function getPersistentContext() {
  if (!browserContext) {
    browserContext = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: ['--disable-blink-features=AutomationControlled'],
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
  }
  return browserContext;
}

async function detectCaptcha(page) {
  // Check for common CAPTCHA iframe/container presence which is more reliable than text alone
  const captchaSelectors = [
    'iframe[src*="captcha"]',
    'iframe[src*="recaptcha"]',
    '#captcha-form',
    '#g-recaptcha',
    '.g-recaptcha',
    '#cf-challenge', // Cloudflare
    '#px-captcha',    // PerimeterX
  ];

  for (const selector of captchaSelectors) {
    if (await page.$(selector)) return true;
  }

  // Check for specific Google "unusual traffic" title/text
  const content = await page.content();
  const lowerContent = content.toLowerCase();

  // Only trigger on specific known block strings
  const blockStrings = [
    "our systems have detected unusual traffic",
    "please verify you are a human",
    "verify you are human",
    "human verification"
  ];

  return blockStrings.some(text => lowerContent.includes(text));
}

async function scrollPage(page) {
  try {
    await page.evaluate(async () => {
      for (let i = 0; i < 3; i++) {
        window.scrollBy(0, 600);
        await new Promise(r => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });
  } catch (e) { /* ignore scroll errors */ }
}

function humanDelay(min = 1000, max = 3000) {
  return new Promise(r => setTimeout(r, Math.random() * (max - min) + min));
}

async function getActivePage() {
  const context = await getPersistentContext();
  const pages = context.pages();
  if (pages.length > 0) {
    return pages[0]; // Reuse the first page for consistency
  }
  return await context.newPage();
}

export async function browser_navigate(url) {
  const page = await getActivePage();
  try {
    // Navigate with a more relaxed wait condition
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Give it a few seconds to load dynamically
    await humanDelay(3000, 5000);

    if (await detectCaptcha(page)) {
      return {
        content: [{ type: "text", text: "⚠️ CAPTCHA Detected! Please solve it in the browser window." }]
      };
    }

    await scrollPage(page);

    const content = await page.evaluate(() => {
      // Fallback for empty body
      if (!document.body) return "No content found in body.";
      return document.body.innerText;
    });

    const title = await page.title();


    return {
      content: [
        {
          type: "text",
          text: `Title: ${title}\nURL: ${url}\n\nContent:\n${content.substring(0, 1000)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Browser navigation failed: ${error.name}: ${error.message}`,
        },
      ],
    };
  }
}

export async function browser_screenshot(url) {
  const page = await getActivePage();
  try {
    if (url) {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await humanDelay(2000, 3000);
    }

    if (await detectCaptcha(page)) {
      return {
        content: [{ type: "text", text: "⚠️ CAPTCHA Detected! Solve it in the browser window first." }]
      };
    }

    const screenshot = await page.screenshot({ fullPage: true });

    return {
      content: [
        {
          type: "text",
          text: `Screenshot of ${url} taken successfully.`,
        },
        {
          type: "image",
          data: screenshot.toString("base64"),
          mimeType: "image/png",
        }
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Browser screenshot failed: ${error.name}: ${error.message}`,
        },
      ],
    };
  }
}

export async function browser_search(query) {
  const page = await getActivePage();
  try {
    await humanDelay(1500, 3000);
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    // Use domcontentloaded instead of networkidle to prevent freezing
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Wait a bit for JS to execute
    await humanDelay(2000, 4000);

    // Loop and wait for results if CAPTCHA is detected
    let attempts = 0;
    while (attempts < 10) {
      const isCaptcha = await detectCaptcha(page);
      const hasResults = await page.evaluate(() => document.querySelectorAll('div.g').length > 0);

      if (hasResults) break;

      if (isCaptcha) {
        console.log("Waiting for user to solve CAPTCHA...");
        // We don't return here, we wait for the user to solve it in the open window
        await humanDelay(5000, 5000);
      } else {
        // No results and no obvious captcha, maybe still loading?
        await humanDelay(2000, 2000);
      }
      attempts++;
    }

    // Check if results are already there before scrolling
    const hasResultsNow = await page.evaluate(() => document.querySelectorAll('div.g').length > 0);
    if (!hasResultsNow) {
      await scrollPage(page);
    }

    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div.g, .v7W49e > div, .MjjYud'));
      return items.map(item => {
        const titleEl = item.querySelector('h3');
        const linkEl = item.querySelector('a');
        const snippetEl = item.querySelector('.VwiC3b, .st, .MUF9Of, .yY79el');

        return {
          title: titleEl ? titleEl.innerText : "No Title",
          link: linkEl ? linkEl.href : "",
          snippet: snippetEl ? snippetEl.innerText : ""
        };
      }).filter(item => item.link && item.link.startsWith('http') && !item.link.includes('google.com/search'));
    });

    const pageTitle = await page.title();


    if (results.length === 0) {
      return {
        content: [{ type: "text", text: `No search results found on page "${pageTitle}". Google might be blocking or the page structure changed.` }]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Search results for "${query}":\n\n${results.map(r => `Title: ${r.title}\nLink: ${r.link}\nSnippet: ${r.snippet}\n`).join('\n---\n')}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `❌ Browser search failed: ${error.message}` }]
    };
  }
}

export async function browser_click(selector) {
  const page = await getActivePage();
  try {
    await page.waitForSelector(selector, { timeout: 15000 });

    // Smooth scroll to element
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, selector);
    await humanDelay(500, 1000);

    await page.click(selector);
    await humanDelay(2000, 4000);

    return {
      content: [{ type: "text", text: `Successfully clicked "${selector}". Current URL: ${page.url()}` }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `❌ Click failed: ${error.message}` }]
    };
  }
}

export async function browser_type(selector, text) {
  const page = await getActivePage();
  try {
    await page.waitForSelector(selector, { timeout: 15000 });
    await page.fill(selector, text);
    await humanDelay(500, 1000);
    return {
      content: [{ type: "text", text: `Successfully typed into "${selector}"` }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `❌ Type failed: ${error.message}` }]
    };
  }
}

export async function browser_press_key(key) {
  const page = await getActivePage();
  try {
    await page.keyboard.press(key);
    await humanDelay(1000, 2000);
    return {
      content: [{ type: "text", text: `Successfully pressed key "${key}". Current URL: ${page.url()}` }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `❌ Key press failed: ${error.message}` }]
    };
  }
}

export async function browser_wait_for(selector, timeout = 30000) {
  const page = await getActivePage();
  try {
    await page.waitForSelector(selector, { timeout });
    return {
      content: [{ type: "text", text: `Selector "${selector}" is now visible.` }]
    };
    return {
      content: [{ type: "text", text: `Selector "${selector}" is now visible.` }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `❌ Wait for selector failed: ${error.message}` }]
    };
  }
}
