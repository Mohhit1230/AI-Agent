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
  calendar_list_events,
  calendar_add_event,
  calendar_view_day,
  keepListNotes,
  keepAddNote,
  keepUpdateNote,
  keepArchiveNote,
  keepDeleteNote,
  read_project_file,
  update_code_snippet,
  list_project_files,
  git_check_status,
  github_create_issue,
  git_list_commits,
  git_commit_all,
  git_push,
  github_create_pull_request,
  github_list_issues,
  github_list_pull_requests,
  github_get_repo_stats,
  github_get_user_profile,
} from "./mcp.tool.js";
import {
  browser_navigate,
  browser_screenshot,
  browser_search,
  browser_click,
  browser_type,
  browser_press_key,
  browser_wait_for,
} from "./tools/pdf/browserTools.js";
import multer from "multer";
import { Buffer } from "buffer";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Adjust this to your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
    startTime: z
      .string()
      .describe("ISO 8601 format (e.g., 2023-12-25T10:00:00Z)"),
    endTime: z
      .string()
      .describe("ISO 8601 format (e.g., 2023-12-25T11:00:00Z)"),
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
  "List notes from Google Keep",
  {},
  async () => keepListNotes()
);

mcpServer.tool(
  "keepCreateNote",
  "Create a new note in Google Keep",
  {
    title: z.string().optional(),
    text: z.string(),
  },
  async ({ title, text }) => keepAddNote(title, text)
);

mcpServer.tool(
  "keepUpdateNote",
  "Update an existing note in Google Keep",
  {
    id: z.string().describe("The ID of the note to update"),
    title: z.string().optional().describe("New title for the note"),
    text: z.string().optional().describe("New text content for the note"),
  },
  async ({ id, title, text }) => keepUpdateNote(id, title, text)
);

mcpServer.tool(
  "keepArchiveNote",
  "Archive or unarchive a note in Google Keep",
  {
    id: z.string().describe("The ID of the note to archive"),
    archive: z.boolean().optional().default(true).describe("Whether to archive (true) or unarchive (false)"),
  },
  async ({ id, archive }) => keepArchiveNote(id, archive)
);

mcpServer.tool(
  "keepDeleteNote",
  "Delete (move to trash) or restore a note in Google Keep",
  {
    id: z.string().describe("The ID of the note to delete"),
    delete: z.boolean().optional().default(true).describe("Whether to delete (true) or restore (false)"),
  },
  async ({ id, delete: delete_note }) => keepDeleteNote(id, delete_note)
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

mcpServer.tool(
  "gitCheckStatus",
  "Check the current status of the git repository",
  {},
  async () => git_check_status()
);

mcpServer.tool(
  "githubCreateIssue",
  "Create a new issue on a GitHub repository",
  {
    owner: z
      .string()
      .describe(
        "The account owner of the repository. The name is not case sensitive."
      ),
    repo: z
      .string()
      .describe(
        "The name of the repository without the .git extension. The name is not case sensitive."
      ),
    title: z.string().describe("The title of the issue."),
    body: z.string().describe("The contents of the issue."),
  },
  async ({ owner, repo, title, body }) =>
    github_create_issue(owner, repo, title, body)
);

mcpServer.tool(
  "gitListCommits",
  "List the latest commits in the repository",
  {
    count: z
      .number()
      .optional()
      .default(5)
      .describe("Number of commits to list"),
  },
  async ({ count }) => git_list_commits(count)
);

mcpServer.tool(
  "gitCommitAll",
  "Stage all changes and commit them with a message",
  {
    message: z.string().describe("The commit message"),
  },
  async ({ message }) => git_commit_all(message)
);

mcpServer.tool(
  "gitPush",
  "Push the committed changes to the remote repository",
  {},
  async () => git_push()
);

mcpServer.tool(
  "githubCreatePullRequest",
  "Create a new pull request on a GitHub repository",
  {
    owner: z.string(),
    repo: z.string(),
    title: z.string(),
    body: z.string(),
    head: z
      .string()
      .describe("The name of the branch where your changes are implemented."),
    base: z
      .string()
      .optional()
      .default("main")
      .describe("The name of the branch you want the changes pulled into."),
  },
  async ({ owner, repo, title, body, head, base }) =>
    github_create_pull_request(owner, repo, title, body, head, base)
);

mcpServer.tool(
  "githubListIssues",
  "List issues for a specific GitHub repository",
  {
    owner: z.string(),
    repo: z.string(),
    state: z.enum(["open", "closed", "all"]).optional().default("open"),
  },
  async ({ owner, repo, state }) => github_list_issues(owner, repo, state)
);

mcpServer.tool(
  "githubListPullRequests",
  "List pull requests for a specific GitHub repository",
  {
    owner: z.string(),
    repo: z.string(),
    state: z.enum(["open", "closed", "all"]).optional().default("open"),
  },
  async ({ owner, repo, state }) =>
    github_list_pull_requests(owner, repo, state)
);

mcpServer.tool(
  "githubGetRepoStats",
  "Get statistics like stars and forks for a repository",
  {
    owner: z.string(),
    repo: z.string(),
  },
  async ({ owner, repo }) => github_get_repo_stats(owner, repo)
);

mcpServer.tool(
  "githubGetUserProfile",
  "Get public profile information for a GitHub user",
  {
    username: z.string(),
  },
  async ({ username }) => github_get_user_profile(username)
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

## TOKEN EFFICIENCY (CRITICAL)
- **Be concise**: Give point-to-point answers. No fluff, no padding.
- **Never ask follow-up questions** unless absolutely required (like missing critical info).
- **Skip pleasantries**: No "Great question!" or "Happy to help!"
- **Direct answers**: State the answer first, then brief explanation if needed.
- **Avoid repetition**: Don't restate the question or summarize what you already said.
- **Single response**: Complete the entire answer in one go.

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
 
## GIT & GITHUB PROTOCOLS
- Use \`gitCheckStatus\` to see modified files and current branch.
- Use \`gitListCommits\` when asked to summarize recent work or check history.
- Use \`gitCommitAll\` to stage and commit changes.
- Use \`gitPush\` to send local changes to the remote repository.
- Use \`githubCreateIssue\` to report bugs or request features.
- Use \`githubListIssues\` to see existing bugs or tasks.
- Use \`githubListPullRequests\` to see work-in-progress by others.
- Use \`githubCreatePullRequest\` to propose your changes formally.
- Use \`githubGetRepoStats\` and \`githubGetUserProfile\` for research.
- **Workflow Strategy**: If a user says "Commit and push", call \`gitCommitAll\` first, then \`gitPush\`.
- **Proactive Issue Research**: If a user asks about a repo, check its stats and issues to provide a complete picture.
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
      if (loopCount > 0) await new Promise((r) => setTimeout(r, 200));

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: currentMessages,
        config: { tools: [{ functionDeclarations: tools }] },
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
        console.log(
          `[Loop ${loopCount}] tool arguments: `,
          JSON.stringify(toolCall.args, null, 2)
        );

        try {
          const toolResult = await mcpClient.callTool({
            name: toolCall.name,
            arguments: toolCall.args,
          });

          lastToolResult = toolResult.content;
          console.log(
            `[Loop ${loopCount}] tool result: `,
            JSON.stringify(toolResult.content, null, 2).substring(0, 100)
          );

          // Format tool response for Gemini
          currentMessages.push({
            role: "function",
            parts: [
              {
                functionResponse: {
                  name: toolCall.name,
                  response: { content: toolResult.content },
                },
              },
            ],
          });
        } catch (err) {
          console.error(`[Loop ${loopCount}] Tool call failed:`, err);
          currentMessages.push({
            role: "function",
            parts: [
              {
                functionResponse: {
                  name: toolCall.name,
                  response: { error: err.message },
                },
              },
            ],
          });
        }
        loopCount++;
      } else {
        // Final text response
        let responseData = { text: part.text };

        // Attach screenshot if it was the last tool call or if we stopped
        if (lastToolResult && Array.isArray(lastToolResult)) {
          const imagePart = lastToolResult.find((c) => c.type === "image");
          if (imagePart) {
            // Send image as structured data instead of embedding in text
            responseData = {
              type: "image",
              data: `data:${imagePart.mimeType};base64,${imagePart.data}`,
              text: part.text,
            };
          }

          const resourceLink = lastToolResult.find(
            (c) => c.type === "resource_link"
          );
          if (resourceLink) {
            responseData.text = resourceLink;
          }
        }

        return res.json({ data: responseData });
      }
    }

    return res.json({
      data: {
        text: "⚠️ Maximum automation steps reached. Please check the browser window.",
      },
    });
  } catch (err) {
    console.log("❌ Proxy error:", err);
    if (err.status === 429 || err.message?.includes("429")) {
      return res.status(429).json({
        data: {
          text: "⚠️ **Quota Exceeded (429)**: The AI is getting too many requests. Please wait a minute and try again!",
        },
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
