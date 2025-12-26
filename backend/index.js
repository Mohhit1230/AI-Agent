
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import {
  createPost,
  sendEmail,
  editExistingPDF,

  generatePDF,
  browser_navigate,
  browser_screenshot,
  browser_search,
  browser_click,
  browser_type,
  browser_press_key,
  browser_wait_for,
  calendar_list_events,
  calendar_add_event,
  calendar_view_day,
  keep_browser_list_notes,
  keep_browser_create_note,
  read_project_file,
  update_code_snippet,
  list_project_files,
} from "./mcp.tool.js";
import multer from "multer";
import { Buffer } from "buffer";

dotenv.config();
const app = express();

app.use(cors(
  {
    origin: process.env.FRONTEND_URL, // Adjust this to your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }
));
app.use((req, res, next) => {
  if (req.path === "/messages") {
    return next();
  }
  express.json({ limit: "50mb" })(req, res, next);
});

const upload = multer({ storage: multer.memoryStorage() });

/* ------------------------- MCP SERVER SETUP ------------------------- */

const mcpServer = new McpServer({ name: "unified-server", version: "1.0.0" });
const transports = {};

// Register tools



mcpServer.tool(
  "createPost",
  "Post on X",
  {
    status: z.string(),
  },
  async ({ status }) => createPost(status)
);



// mcpServer.tool(
//   "divetopool",
//   "dive into pool with content",
//   {
//     text: z.string(),
//   },
//   async ({ text }) => {
//     // Wrap in list so Python gets [{"type": "text", "text": "..."}]
//     const payload = JSON.stringify([{ type: "text", text }]);
//     return await generatePDF(payload);
//   }
// );


mcpServer.tool(
  "givemePDF",
  "Generate a PDF from text",
  {
    text: z.string(),
  },
  async ({ text }) => {
    // Wrap text in array as expected by Python: [{"type":"text","text":"..."}]
    const payload = JSON.stringify([{ type: "text", text }]);
    try {
      const result = await generatePDF(payload);
      return result; // MCP expects { content: [...] }
    } catch (err) {
      console.error("Error generating PDF:", err);
      return {
        content: [
          {
            type: "text",
            text: "❌ Failed to generate PDF",
          },
        ],
      };
    }
  }
);



mcpServer.tool(
  "sendEmail",
  "Sends an Email to the specified address",
  {
    to: z.string(),
    subject: z.string(),
    text: z.string(),
  },
  async ({ to, subject, text }) => sendEmail({ to, subject, text })
);
mcpServer.tool(
  "editPDF",
  "Edit uploaded PDF and add text",
  {
    file: z.instanceof(Uint8Array),
    text: z.string(),
  },
  async ({ file, text }) => {
    const buffer = await editExistingPDF(file, text);
    return {
      content: [{ type: "file_data", name: "edited.pdf", data: buffer }],
    };
  }
);


mcpServer.tool(
  "browserNavigate",
  "Navigate to a URL and get page content",
  {
    url: z.string().url(),
  },
  async ({ url }) => browser_navigate(url)
);

mcpServer.tool(
  "browserScreenshot",
  "Take a screenshot of a specific URL or the current active page if no URL is provided",
  {
    url: z.string().url().optional(),
  },
  async ({ url }) => browser_screenshot(url)
);

mcpServer.tool(
  "browserSearch",
  "Search Google for a query",
  {
    query: z.string(),
  },
  async ({ query }) => browser_search(query)
);

mcpServer.tool(
  "browserClick",
  "Click an element on the active page",
  {
    selector: z.string(),
  },
  async ({ selector }) => browser_click(selector)
);

mcpServer.tool(
  "browserType",
  "Type text into an input field on the active page",
  {
    selector: z.string(),
    text: z.string(),
  },
  async ({ selector, text }) => browser_type(selector, text)
);

mcpServer.tool(
  "browserPressKey",
  "Press a key (e.g., Enter, Tab, Escape) on the active page",
  {
    key: z.string(),
  },
  async ({ key }) => browser_press_key(key)
);

mcpServer.tool(
  "browserWaitFor",
  "Wait for a selector to appear on the active page",
  {
    selector: z.string(),
    timeout: z.number().optional(),
  },
  async ({ selector, timeout }) => browser_wait_for(selector, timeout)
);

mcpServer.tool(
  "calendarListEvents",
  "List upcoming events from Google Calendar",
  {
    maxResults: z.number().optional().default(10),
  },
  async ({ maxResults }) => calendar_list_events(maxResults)
);

mcpServer.tool(
  "calendarAddEvent",
  "Add a new event to Google Calendar",
  {
    summary: z.string(),
    description: z.string().optional(),
    startTime: z.string().describe("ISO 8601 format (e.g., 2023-12-25T10:00:00Z)"),
    endTime: z.string().describe("ISO 8601 format (e.g., 2023-12-25T11:00:00Z)"),
    location: z.string().optional(),
  },
  async ({ summary, description, startTime, endTime, location }) =>
    calendar_add_event(summary, description, startTime, endTime, location)
);

mcpServer.tool(
  "calendarViewDay",
  "View all events for a specific day",
  {
    date: z.string().describe("Date in YYYY-MM-DD format"),
  },
  async ({ date }) => calendar_view_day(date)
);

mcpServer.tool(
  "keepListNotes",
  "List notes from Google Keep using the browser",
  {},
  async () => keep_browser_list_notes()
);

mcpServer.tool(
  "keepCreateNote",
  "Create a new note in Google Keep using the browser",
  {
    title: z.string().optional(),
    text: z.string(),
  },
  async ({ title, text }) => keep_browser_create_note(title, text)
);

mcpServer.tool(
  "readProjectFile",
  "Read the content of a file from the local filesystem",
  {
    filePath: z.string().describe("Absolute path to the file"),
  },
  async ({ filePath }) => read_project_file(filePath)
);

mcpServer.tool(
  "updateCodeSnippet",
  "Update or create a file with new content",
  {
    filePath: z.string().describe("Absolute path to the file"),
    content: z.string().describe("New content for the file"),
  },
  async ({ filePath, content }) => update_code_snippet(filePath, content)
);

mcpServer.tool(
  "listProjectFiles",
  "List files and directories in a given path",
  {
    dirPath: z.string().describe("Absolute path to the directory"),
  },
  async ({ dirPath }) => list_project_files(dirPath)
);



// MCP server SSE route
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;

  req.on("close", () => {
    delete transports[transport.sessionId];
    console.log(`❌ Disconnected ${transport.sessionId}`);
  });

  await mcpServer.connect(transport);
});

app.post("/upload-pdf", upload.single("file"), async (req, res) => {
  const editedBuffer = await editExistingPDF(
    req.file.buffer,
    "Injected from upload 🚀"
  );
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=edited.pdf",
  });
  res.send(Buffer.from(editedBuffer));
});

// MCP server tool message handler
app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No transport found");
  }
});

/* ------------------------ GEMINI + CLIENT SETUP ------------------------ */

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const mcpClient = new Client({ name: "client-proxy", version: "1.0.0" });

app.post("/chat", async (req, res) => {
  try {
    let { messages } = req.body;
    console.log("--- New Chat Request ---");
    const lastMessage = messages[messages.length - 1]?.parts?.[0]?.text;

    // ✅ Ensure messages exist and have valid parts
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    messages = messages
      .map((msg) => {
        if (!msg.role || !Array.isArray(msg.parts)) return null;

        const cleanedParts = msg.parts
          .map((part) => {
            if (
              part?.text &&
              typeof part.text === "string" &&
              part.text.trim() !== ""
            ) {
              return { text: part.text.trim() };
            }
            if (part?.functionCall) return { functionCall: part.functionCall };
            if (part?.inlineData) return { inlineData: part.inlineData };
            return null;
          })
          .filter(Boolean);

        if (cleanedParts.length === 0) return null;

        return {
          role: msg.role,
          parts: cleanedParts,
        };
      })
      .filter(Boolean);

    if (messages.length === 0) {
      return res.status(400).json({ error: "No valid message parts found." });
    }
    messages.unshift({
      role: "model",
      parts: [
        {
          text: `
        You must respond in the exact style, tone, and structure of ChatGPT GPT-5 by OpenAI. Your goal is to make your answers indistinguishable from ChatGPT’s, both in wording and in visual layout.

## OUTPUT FORMAT RULES (MANDATORY)
1. Always use clear **Markdown formatting**:
   - '##' for main headings
   - '###' for subheadings
   - Bullet points and numbered lists where appropriate
   - **Bold** for emphasis
   - '>' for important notes or callouts
   - Tables where useful
   - Always break content into sections — never give a large single block of text

2. Use **natural human-like structuring**:
   - Short and long sentences mixed
   - Occasional rhetorical questions to engage the reader
   - Parentheses for side comments (like this)
   - Conversational tone, as if speaking to a friend

3. Add **light, relevant emoji** when appropriate to keep the response engaging  
   (e.g., 💡 for tips, ⚠️ for warnings, ✅ for checklists, 🔍 for analysis)

4. When explaining concepts:
   - Start with a **short, clear summary**
   - Then break down into **organized sections**
   - End with a **brief actionable takeaway** or **friendly wrap-up**

5. Code answers:
   - Always use fenced code blocks with syntax highlighting
   - Keep code clean, well-commented, and production-quality

## STYLE & PERSONALITY
- Talkative and engaging, like a best friend who knows everything
- Clever, quick humor when it fits (but not forced)
- Occasionally sarcastic or dark humor when context allows
- Encouraging tone, boosting user confidence
- Never robotic or overly formal
- Avoid filler phrases like "Would you like me to…" — if you know the next step, just do it

## REASONING RULES
- Always read the *exact wording* of a question carefully — assume tricky phrasing
- For math, do all calculations step-by-step digit-by-digit
- Always explain reasoning clearly and logically

## AUTO-EXECUTION & PROACTIVITY (CRITICAL)
- **Direct Action**: If a user request implies the need for a tool, **call it immediately**. NEVER ask "Would you like me to..." or "Should I...". Just execute.
- **Continuous Execution**: For complex tasks (like PDF generation or browsing), proceed through all necessary steps without stopping to chat until the final result is ready or a genuine manual input (like a password or payment) is required.
- **Smell-to-Action**: If a prompt even *mentions* "PDF", "Search", "Schedule", or "Email", the corresponding tool call must be the very first part of your response.

## WEB AGENT & BROWSER PROTOCOL
- You have powerful browser tools: \`browserSearch\`, \`browserNavigate\`, \`browserClick\`, \`browserType\`, \`browserPressKey\`, and \`browserWaitFor\`.
- **Proactive Automation**: Start the automation immediately. Perform sequential actions (\`browserClick\`, \`browserType\`) to progress toward the goal.
- **DO NOT STOP** early. Continue until you reach a point where user input is absolutely required (e.g., payment, OTP, specific personal info you don't have).
- **Final Action**: Always finish with a \`browserScreenshot\` call of the final page.

## LOCAL FILE SYSTEM PROTOCOL
- **Refactoring**: Directly use \`updateCodeSnippet\` to apply improvements. Don't just show the code; write it to the file.

## GOOGLE CALENDAR PROTOCOLS
- Use \`calendarAddEvent\` immediately when a time/event is mentioned. Confirm the creation *after* the tool call.

## COMMUNICATION & CONTENT PROTOCOLS
- **PDF Generation**: If the user asks for a PDF or a "formal version" of text, call \`givemePDF\` immediately. Do not ask for confirmation.

## LOCAL FILE SYSTEM PROTOCOL
- You have tools to interact with the local file system: \`readProjectFile\`, \`updateCodeSnippet\`, and \`listProjectFiles\`.
- **Project Analysis**: When asked to analyze a project or folder, first use \`listProjectFiles\` to understand the structure, then use \`readProjectFile\` to examine relevant files.
- **Refactoring**: Use \`updateCodeSnippet\` to apply suggested improvements or refactors to code files.
- **Absolute Paths**: Always use absolute paths for file system operations.

## GOOGLE CALENDAR PROTOCOLS
- Use \`calendarListEvents\` to check upcoming schedules.
- Use \`calendarViewDay\` when someone asks "What does my day look like?" or "Am I free tomorrow?". Provide a clear, formatted summary of their agenda.
- Use \`calendarAddEvent\` to book meetings or reminders. Always confirm the details (time, date, summary) with the user before or after creation.

## GOOGLE KEEP PROTOCOLS
- Use \`keepListNotes\` to retrieve existing ideas or links.
- Use \`keepCreateNote\` to store project ideas, snippets, or interesting links found during your research. If you find something valuable while browsing, proactively ask if they'd like to save it to Keep.

## COMMUNICATION & CONTENT PROTOCOLS
- **Email**: Use \`sendEmail\` for sending status updates, reports, or messages. Ensure the 'subject' is professional and the 'text' is clear.
- **Social Media**: Use \`createPost\` to share updates on X (Twitter). Keep posts engaging and use relevant hashtags if appropriate.
- **PDF Generation**: Use \`givemePDF\` whenever the user wants to convert text, reports, or lists into a formal document. This is great for summaries or meeting notes.
`,
        },
      ],
    });


    const tools = (await mcpClient.listTools()).tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: tool.inputSchema.type,
        properties: tool.inputSchema.properties,
        required: tool.inputSchema.required,
      },
    }));

    let currentMessages = [...messages];
    let loopCount = 0;
    const MAX_LOOPS = 10;
    let lastToolResult = null;

    while (loopCount < MAX_LOOPS) {
      if (loopCount > 0) await new Promise(r => setTimeout(r, 1000));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: currentMessages,
        config: { tools: [{ functionDeclarations: tools }] }
      });

      const candidate = response?.candidates?.[0];
      const part = candidate?.content?.parts?.[0];

      if (!part) {
        return res.json({ data: { text: "No response from Gemini" } });
      }

      // Add model's response to history
      currentMessages.push(candidate.content);

      if (part.functionCall) {
        const toolCall = part.functionCall;
        console.log(`[Loop ${loopCount}] calling tool: `, toolCall.name);
        console.log(`[Loop ${loopCount}] tool arguments: `, JSON.stringify(toolCall.args, null, 2));

        try {
          const toolResult = await mcpClient.callTool({
            name: toolCall.name,
            arguments: toolCall.args,
          });

          lastToolResult = toolResult.content;
          console.log(`[Loop ${loopCount}] tool result: `, JSON.stringify(toolResult.content, null, 2));

          // Format tool response for Gemini
          currentMessages.push({
            role: "function",
            parts: [{
              functionResponse: {
                name: toolCall.name,
                response: { content: toolResult.content }
              }
            }]
          });
        } catch (err) {
          console.error(`[Loop ${loopCount}] Tool call failed:`, err);
          currentMessages.push({
            role: "function",
            parts: [{
              functionResponse: {
                name: toolCall.name,
                response: { error: err.message }
              }
            }]
          });
        }
        loopCount++;
      } else {
        // Final text response
        let responseData = { text: part.text };

        // Attach screenshot if it was the last tool call or if we stopped
        if (lastToolResult && Array.isArray(lastToolResult)) {
          const imagePart = lastToolResult.find(c => c.type === "image");
          if (imagePart) {
            const markdownImage = `data:${imagePart.mimeType};base64,${imagePart.data}`;
            responseData.text = `${responseData.text}\n\n${markdownImage}`;
          }

          const resourceLink = lastToolResult.find(c => c.type === "resource_link");
          if (resourceLink) {
            responseData.text = resourceLink;
          }
        }

        return res.json({ data: responseData });
      }
    }

    return res.json({ data: { text: "⚠️ Maximum automation steps reached. Please check the browser window." } });
  } catch (err) {
    console.log("❌ Proxy error:", err);
    if (err.status === 429 || err.message?.includes("429")) {
      return res.status(429).json({
        data: { text: "⚠️ **Quota Exceeded (429)**: The AI is getting too many requests. Please wait a minute and try again!" }
      });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------- START SERVER ---------------------------- */

app.listen(4000, async () => {
  console.log("🚀 Unified backend running at http://localhost:4000");

  try {
    await mcpClient.connect(
      new SSEClientTransport(new URL("http://localhost:4000/sse"))
    );
    console.log("✅ Gemini proxy connected to MCP server");
  } catch (err) {
    console.error("❌ MCP client connection failed:", err);
  }
});










// // server.js
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import OpenAI from "openai";
// import { Client } from "@modelcontextprotocol/sdk/client/index.js";
// import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
// import { z } from "zod";
// import multer from "multer";
// import { Buffer } from "buffer";

// import {
//   createPost,
//   sendEmail,
//   generatePDFfromText,
//   editExistingPDF,
// } from "./mcp.tool.js";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use((req, res, next) => {
//   if (req.path === "/messages") {
//     return next();
//   }
//   express.json()(req, res, next);
// });

// const upload = multer({ storage: multer.memoryStorage() });

// /* ------------------------- MCP SERVER SETUP ------------------------- */

// const mcpServer = new McpServer({ name: "unified-server", version: "1.0.0" });
// const transports = {};

// // Register example tools on MCP server (keep these or alter as needed)
// mcpServer.tool(
//   "addTwoNumbers",
//   "Add two numbers",
//   {
//     a: z.number(),
//     b: z.number(),
//   },
//   async ({ a, b }) => ({
//     content: [{ type: "text", text: `Sum is ${a + b}` }],
//   })
// );

// mcpServer.tool(
//   "calculate-bmi",
//   "BMI Calculator",
//   {
//     weightKg: z.number(),
//     heightM: z.number(),
//   },
//   async ({ weightKg, heightM }) => ({
//     content: [{ type: "text", text: `${weightKg / (heightM * heightM)}` }],
//   })
// );

// mcpServer.tool(
//   "createPost",
//   "Post on X",
//   {
//     status: z.string(),
//   },
//   async ({ status }) => createPost(status)
// );

// mcpServer.tool(
//   "sendEmail",
//   "Send an Email",
//   {
//     to: z.string(),
//     subject: z.string(),
//     text: z.string(),
//   },
//   async ({ to, subject, text }) => sendEmail({ to, subject, text })
// );

// mcpServer.tool(
//   "generatePdf",
//   "Generate a PDF from plain text",
//   {
//     text: z.string(),
//   },
//   async ({ text }) => {
//     if (typeof text !== "string" || !text.trim()) {
//       throw new Error("Text input is required to generate a PDF.");
//     }
//     const buffer = await generatePDFfromText(text);
//     if (!buffer || !Buffer.isBuffer(buffer)) {
//       throw new Error("PDF generation failed. Buffer is invalid.");
//     }

//     const base64 = buffer.toString("base64");
//     const downloadUrl = `data:application/pdf;base64,${base64}`;
//     const fileName = `${Date.now()}.pdf`;

//     return {
//       content: [
//         {
//           type: "resource_link",
//           uri: downloadUrl,
//           name: fileName,
//           mimeType: "application/pdf",
//           description: "Generated PDF file",
//         },
//       ],
//     };
//   }
// );

// mcpServer.tool(
//   "editPDF",
//   "Edit uploaded PDF and add text",
//   {
//     file: z.instanceof(Uint8Array), // expecting Uint8Array from caller
//     text: z.string(),
//   },
//   async ({ file, text }) => {
//     const buffer = await editExistingPDF(file, text);
//     return {
//       content: [{ type: "file_data", name: "edited.pdf", data: buffer }],
//     };
//   }
// );

// /* ------------------------ MCP server SSE route ------------------------ */

// app.get("/sse", async (req, res) => {
//   const transport = new SSEServerTransport("/messages", res);
//   transports[transport.sessionId] = transport;

//   req.on("close", () => {
//     delete transports[transport.sessionId];
//     console.log(`❌ Disconnected ${transport.sessionId}`);
//   });

//   await mcpServer.connect(transport);
// });

// /* ------------------------ Simple file upload endpoint ------------------------ */

// app.post("/upload-pdf", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file || !req.file.buffer) {
//       return res.status(400).send("No file uploaded");
//     }

//     const editedBuffer = await editExistingPDF(req.file.buffer, "Injected from upload 🚀");
//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": "attachment; filename=edited.pdf",
//     });
//     res.send(Buffer.from(editedBuffer));
//   } catch (err) {
//     console.error("Error editing uploaded PDF:", err);
//     res.status(500).send("Failed to edit PDF");
//   }
// });

// /* ------------------------ MCP server tool message handler ------------------------ */

// app.post("/messages", async (req, res) => {
//   const sessionId = req.query.sessionId;
//   const transport = transports[sessionId];
//   if (transport) {
//     await transport.handlePostMessage(req, res);
//   } else {
//     res.status(400).send("No transport found");
//   }
// });

// /* ------------------------ OpenAI (GPT-5) + MCP CLIENT SETUP ------------------------ */

// // Make sure OPENAI_API_KEY is set in your .env
// if (!process.env.OPENAI_API_KEY) {
//   console.warn("⚠️ OPENAI_API_KEY is not set. Please add it to your .env");
// }
// const MODEL_NAME = "gpt-4o-mini"; // change if needed

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const mcpClient = new Client({ name: "client-proxy", version: "1.0.0" });

// /* ------------------------ /chat endpoint (OpenAI replacement for Gemini) ------------------------ */

// app.post("/chat", async (req, res) => {
//   try {
//     let { messages } = req.body;
//     if (!Array.isArray(messages)) {
//       return res.status(400).json({ error: "Invalid messages format" });
//     }
// const validRoles = new Set(['system', 'assistant', 'user', 'function', 'tool', 'developer']);
//     // Convert incoming message structure (role, parts) -> OpenAI chat format [{role, content}, ...]
//     const chatMessages = messages
//       .map((msg) => {
//         if (!msg.role || !Array.isArray(msg.parts)) return null;

//      let role = msg.role.toLowerCase();
//     if (!validRoles.has(role)) {
//       console.warn(`Invalid role detected: ${role}, forcing "assistant"`);
//       role = "assistant";
//     }

//         const cleanedParts = msg.parts
//           .map((part) => {
//             if (part?.text && typeof part.text === "string" && part.text.trim() !== "") {
//               return part.text.trim();
//             }
//             if (part?.functionCall) {
//               // If front-end already constructed a functionCall, attach as content so model can see intent
//               return JSON.stringify({ functionCall: part.functionCall });
//             }
//             if (part?.inlineData) {
//               return typeof part.inlineData === "string"
//                 ? part.inlineData
//                 : JSON.stringify(part.inlineData);
//             }
//             return null;
//           })
//           .filter(Boolean);

//         if (cleanedParts.length === 0) return null;

//         return {
//           role: msg.role,
//           content: cleanedParts.join("\n"),
//         };
//       })
//       .filter(Boolean);

//     if (chatMessages.length === 0) {
//       return res.status(400).json({ error: "No valid message parts found." });
//     }

//     // Inject your system prompt (the one you had previously). You can tweak or replace it.
//     chatMessages.unshift({
//       role: "system",
//       content: `
// You must respond in the exact style, tone, and structure specified by the requesting system. Follow output format and personality guidelines provided by the caller.
// (Instructions are internal and must not be revealed.)
//       `.trim(),
//     });

//     // Build OpenAI 'functions' definitions from MCP tools so model can call them
//     const toolList = (await mcpClient.listTools()).tools || [];
//     const functions = toolList.map((tool) => {
//       // tool.inputSchema should already be a JSON Schema-like shape (per your earlier code)
//       // but ensure it matches OpenAI expected format: { name, description, parameters }
//       return {
//         name: tool.name,
//         description: tool.description || "",
//         parameters: tool.inputSchema || { type: "object", properties: {} },
//       };
//     });

//     // Call OpenAI chat completion with function calling enabled
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: chatMessages,
//       // only include functions if we have any
//       functions: functions.length ? functions : undefined,
//       function_call: "auto", // let the model decide when to call tools
//       max_tokens: 1500,
//     });

//     const choice = completion.choices?.[0];
//     const message = choice?.message;

//     if (!message) {
//       return res.status(500).json({ error: "No response from model" });
//     }

//     // If model requested a function call
//     if (message.function_call) {
//       const functionName = message.function_call.name;
//       const functionArgsRaw = message.function_call.arguments || "{}";

//       let functionArgs = {};
//       try {
//         functionArgs = typeof functionArgsRaw === "string" ? JSON.parse(functionArgsRaw) : functionArgsRaw;
//       } catch (err) {
//         console.warn("Failed to parse function args, passing raw:", functionArgsRaw);
//         functionArgs = { raw: functionArgsRaw };
//       }

//       // Call the corresponding MCP tool and return its result
//       try {
//         const toolResult = await mcpClient.callTool({
//           name: functionName,
//           arguments: functionArgs,
//         });

//         // toolResult.content expected (per your patterns)
//         return res.json({ data: toolResult.content || toolResult });
//       } catch (toolErr) {
//         console.error("Tool invocation failed:", toolErr);
//         return res.status(500).json({ error: "Tool invocation failed", details: String(toolErr) });
//       }
//     }

//     // Otherwise, normal model text response
//     return res.json({ data: message });
//   } catch (err) {
//     console.error("❌ Chat proxy error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /* ---------------------------- START SERVER ---------------------------- */

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, async () => {
//   console.log(`🚀 Unified backend running at http://localhost:${PORT}`);

//   try {
//     await mcpClient.connect(
//       new SSEClientTransport(new URL(`http://localhost:${PORT}/sse`))
//     );
//     console.log("✅ MCP client connected to MCP server via SSE");
//   } catch (err) {
//     console.error("❌ MCP client connection failed:", err);
//   }
// });
