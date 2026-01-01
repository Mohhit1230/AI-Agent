import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
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
  youtube_fetch_transcript,
  article_summarize,
  content_extract_key_points,
} from "./mcp.tool.js";
import {
  browser_navigate,
  browser_screenshot,
  browser_search,
  browser_click,
  browser_type,
  browser_press_key,
  browser_wait_for,
} from "./tools/browserTools.js";
import multer from "multer";
import { Buffer } from "buffer";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);
app.use(cookieParser());
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

// CONTENT SUMMARIZER TOOLS
mcpServer.tool(
  "youtubeGetTranscript",
  "Fetch the transcript/captions from a YouTube video URL. Use this to get the full text content of any YouTube video for summarization or analysis.",
  {
    url: z.string().url().describe("The YouTube video URL (supports youtube.com/watch, youtu.be, shorts, etc.)"),
  },
  async ({ url }) => youtube_fetch_transcript(url)
);

mcpServer.tool(
  "articleSummarize",
  "Fetch and extract the main content from an article or webpage URL. Removes navigation, ads, and other clutter to get the core text.",
  {
    url: z.string().url().describe("The article or webpage URL to extract content from"),
  },
  async ({ url }) => article_summarize(url)
);

mcpServer.tool(
  "extractKeyPoints",
  "Extract key takeaways and important points from text, a YouTube video, or an article URL. Returns content ready for AI summarization.",
  {
    input: z.string().describe("Either a URL (YouTube or article) or raw text to extract key points from"),
    numPoints: z.number().optional().default(5).describe("Number of key points to extract (default: 5)"),
  },
  async ({ input, numPoints }) => content_extract_key_points(input, numPoints)
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

/* ------------------------ MULTI-PROVIDER AI SETUP ------------------------ */

// Initialize all AI providers
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const geminiAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const mcpClient = new Client({ name: "client-proxy", version: "1.0.0" });

// System prompt for all providers
const SYSTEM_PROMPT = `You must respond in the exact style, tone, and structure of ChatGPT GPT-5 by OpenAI. Your goal is to make your answers indistinguishable from ChatGPT's, both in wording and in visual layout.

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

## YOUTUBE & ARTICLE SUMMARIZER PROTOCOLS
- Use \`youtubeGetTranscript\` when a user shares a YouTube URL and asks for a summary, key points, or information about the video.
- Use \`articleSummarize\` when a user shares an article/webpage URL and wants the content extracted or summarized.
- Use \`extractKeyPoints\` when a user specifically asks for "key takeaways", "important points", or "main ideas" from any content.
- **Immediate Execution**: When given a YouTube or article URL with a summarization request, call the appropriate tool immediately. Don't ask for confirmation.
- **Format Output**: After getting the transcript/content, provide a well-structured summary with:
  - 📌 **Key Takeaways** (numbered list)
  - 📝 **Brief Summary** (2-3 sentences)
  - 💡 **Main Insights** (if applicable)
- **Time-Saving Approach**: Emphasize how the summary saves time vs. watching/reading the full content.
`;

// Convert MCP tools to OpenAI format
function convertToolsForOpenAI(mcpTools) {
  return mcpTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: tool.inputSchema.type || "object",
        properties: tool.inputSchema.properties || {},
        required: tool.inputSchema.required || [],
      },
    },
  }));
}



// Convert MCP tools to Gemini format
function convertToolsForGemini(mcpTools) {
  return mcpTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: tool.inputSchema.type,
      properties: tool.inputSchema.properties,
      required: tool.inputSchema.required,
    },
  }));
}

// Convert Gemini-format messages to OpenAI format
function convertMessagesForOpenAI(geminiMessages) {
  const openaiMessages = [];

  for (const msg of geminiMessages) {
    if (!msg.role || !msg.parts) continue;

    for (const part of msg.parts) {
      if (part.text) {
        openaiMessages.push({
          role: msg.role === "model" ? "assistant" : msg.role,
          content: part.text,
        });
      } else if (part.functionCall) {
        openaiMessages.push({
          role: "assistant",
          content: null,
          tool_calls: [{
            id: `call_${Date.now()}`,
            type: "function",
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args || {}),
            },
          }],
        });
      } else if (part.functionResponse) {
        openaiMessages.push({
          role: "tool",
          tool_call_id: `call_${Date.now()}`,
          content: JSON.stringify(part.functionResponse.response || {}),
        });
      } else if (part.inlineData) {
        // Handle images
        openaiMessages.push({
          role: msg.role === "model" ? "assistant" : msg.role,
          content: [{
            type: "image_url",
            image_url: {
              url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            },
          }],
        });
      }
    }
  }

  return openaiMessages;
}



// OpenAI Provider
async function callOpenAI(messages, tools, mcpClientRef) {
  if (!openaiClient) throw new Error("OpenAI not configured");

  const openaiMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...convertMessagesForOpenAI(messages),
  ];
  const openaiTools = convertToolsForOpenAI((await mcpClientRef.listTools()).tools);

  let currentMessages = [...openaiMessages];
  let loopCount = 0;
  const MAX_LOOPS = 10;
  let lastToolResult = null;

  while (loopCount < MAX_LOOPS) {
    if (loopCount > 0) await new Promise((r) => setTimeout(r, 200));

    const response = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: currentMessages,
      tools: openaiTools.length > 0 ? openaiTools : undefined,
    });

    const choice = response.choices[0];
    const message = choice.message;
    console.log("response: ", JSON.stringify(message).substring(0, 100));
    currentMessages.push(message);

    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

        console.log(`[OpenAI Loop ${loopCount}] calling tool: `, toolName);
        console.log(`[OpenAI Loop ${loopCount}] tool arguments: `, JSON.stringify(toolArgs, null, 2));

        try {
          const toolResult = await mcpClientRef.callTool({
            name: toolName,
            arguments: toolArgs,
          });

          lastToolResult = toolResult.content;
          console.log(`[OpenAI Loop ${loopCount}] tool result: `, JSON.stringify(toolResult.content, null, 2).substring(0, 100));

          currentMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult.content),
          });
        } catch (err) {
          console.error(`[OpenAI Loop ${loopCount}] Tool call failed:`, err);
          currentMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: err.message }),
          });
        }
      }
      loopCount++;
    } else {
      // Final response
      return { text: message.content, lastToolResult, provider: "openai" };
    }
  }

  return { text: "⚠️ Maximum automation steps reached.", lastToolResult, provider: "openai" };
}



// Gemini Provider
async function callGemini(messages, tools, mcpClientRef) {
  const geminiTools = convertToolsForGemini((await mcpClientRef.listTools()).tools);

  // Add system prompt as first message
  const messagesWithSystem = [
    { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
    ...messages,
  ];

  let currentMessages = [...messagesWithSystem];
  let loopCount = 0;
  const MAX_LOOPS = 10;
  let lastToolResult = null;

  while (loopCount < MAX_LOOPS) {
    if (loopCount > 0) await new Promise((r) => setTimeout(r, 200));

    const response = await geminiAI.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
      contents: currentMessages,
      config: { tools: [{ functionDeclarations: geminiTools }] },
    });

    const candidate = response?.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (!part) {
      return { text: "No response from Gemini", lastToolResult, provider: "gemini" };
    }

    currentMessages.push(candidate.content);

    if (part.functionCall) {
      const toolCall = part.functionCall;
      console.log(`[Gemini Loop ${loopCount}] calling tool: `, toolCall.name);
      console.log(`[Gemini Loop ${loopCount}] tool arguments: `, JSON.stringify(toolCall.args, null, 2));

      try {
        const toolResult = await mcpClientRef.callTool({
          name: toolCall.name,
          arguments: toolCall.args,
        });

        lastToolResult = toolResult.content;
        console.log(`[Gemini Loop ${loopCount}] tool result: `, JSON.stringify(toolResult.content, null, 2).substring(0, 100));

        currentMessages.push({
          role: "function",
          parts: [{
            functionResponse: {
              name: toolCall.name,
              response: { content: toolResult.content },
            },
          }],
        });
      } catch (err) {
        console.error(`[Gemini Loop ${loopCount}] Tool call failed:`, err);
        currentMessages.push({
          role: "function",
          parts: [{
            functionResponse: {
              name: toolCall.name,
              response: { error: err.message },
            },
          }],
        });
      }
      loopCount++;
    } else {
      return { text: part.text, lastToolResult, provider: "gemini" };
    }
  }

  return { text: "⚠️ Maximum automation steps reached.", lastToolResult, provider: "gemini" };
}

// Main AI caller with fallback: OpenAI → Gemini
async function callAIWithFallback(messages, mcpClientRef) {
  const providers = [
    { name: "OpenAI", fn: callOpenAI, available: !!openaiClient },
    { name: "Gemini", fn: callGemini, available: true }, // Gemini is always available
  ];

  for (const provider of providers) {
    if (!provider.available) {
      console.log(`⏭️ Skipping ${provider.name} - not configured`);
      continue;
    }

    try {
      console.log(`🔄 Trying ${provider.name}...`);
      const result = await provider.fn(messages, null, mcpClientRef);
      console.log(`✅ ${provider.name} succeeded`);
      return result;
    } catch (err) {
      console.error(`❌ ${provider.name} failed:`, err.message);

      // Check for rate limiting
      if (err.status === 429 || err.message?.includes("429") || err.message?.includes("rate")) {
        console.log(`⚠️ ${provider.name} rate limited, trying next provider...`);
        continue;
      }

      // For other errors, also try next provider
      console.log(`⚠️ ${provider.name} error, trying next provider...`);
      continue;
    }
  }

  throw new Error("All AI providers failed");
}

app.post("/chat", async (req, res) => {
  try {
    let { messages } = req.body;
    console.log("--- New Chat Request ---");

    // ✅ Ensure messages exist and have valid parts
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    // Clean and validate messages (keep Gemini format as the canonical format)
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

    // Call AI with fallback (OpenAI → Gemini)
    const result = await callAIWithFallback(messages, mcpClient);

    // Build response data
    let responseData = { text: result.text, provider: result.provider };

    // Attach screenshot or resource link if available
    if (result.lastToolResult && Array.isArray(result.lastToolResult)) {
      const imagePart = result.lastToolResult.find((c) => c.type === "image");
      if (imagePart) {
        responseData = {
          type: "image",
          data: `data:${imagePart.mimeType};base64,${imagePart.data}`,
          text: result.text,
          provider: result.provider,
        };
      }

      const resourceLink = result.lastToolResult.find(
        (c) => c.type === "resource_link"
      );
      if (resourceLink) {
        responseData.text = resourceLink;
      }
    }

    return res.json({ data: responseData });
  } catch (err) {
    console.log("❌ Proxy error:", err);
    if (err.status === 429 || err.message?.includes("429")) {
      return res.status(429).json({
        data: {
          text: "⚠️ **Quota Exceeded (429)**: All AI providers are rate limited. Please wait a minute and try again!",
        },
      });
    }
    if (err.message === "All AI providers failed") {
      return res.status(503).json({
        data: {
          text: "⚠️ **Service Unavailable**: All AI providers failed. Please check your API keys and try again.",
        },
      });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------- AUTH ROUTES ---------------------------- */

app.use("/api/auth", authRoutes);

/* ---------------------------- START SERVER ---------------------------- */

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.log("⚠️ MongoDB not configured (set MONGODB_URI)");
    }

    app.listen(PORT, async () => {
      console.log(`🚀 Unified backend running at http://localhost:${PORT}`);

      try {
        await mcpClient.connect(
          new SSEClientTransport(new URL(`http://localhost:${PORT}/sse`))
        );
        console.log("✅ AI proxy connected to MCP server");
      } catch (err) {
        console.error("❌ MCP client connection failed:", err);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
