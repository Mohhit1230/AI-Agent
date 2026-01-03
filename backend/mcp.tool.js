import { twitterPost } from "./tools/twitterPost.js";
import { email } from "./tools/email.js";
import { editPDF, generatePdf } from "./tools/generatePdf.js";
import { keep_add_note, keep_archive_note, keep_delete_note, keep_list_notes, keep_update_note } from "./tools/google/keep_api.js";
import { add_event, list_events, view_day } from "./tools/google/calender_api.js";
import { check_status, commit_all, create_issue, create_pull_request, get_repo_stats, get_user_profile, list_commits, list_issues, list_pull_requests, push } from "./tools/github_tools.js";
import { fetch_transcript, summarize_article, extract_key_points } from "./tools/contentSummarizer.js";
import { text_to_diagram } from "./tools/textToDiagram.js";
import {
  search_people_info,
  draft_linkedin_post,
  suggest_hashtags,
  analyze_engagement,
  get_user_profile as linkedin_get_profile,
  publish_post,
  publish_post_with_image
} from "./tools/linkedinGenerator.js";
import { mcpServer } from "./config/mcpServer.js";
import { z } from "zod";
import {
  browser_navigate,
  browser_screenshot,
  browser_search,
  browser_click,
  browser_type,
  browser_press_key,
  browser_wait_for,
} from "./tools/browserTools.js";


// Register tools


mcpServer.tool(
  "createPost",
  "Post on X",
  {
    status: z.string(),
  },
  async ({ status }) => twitterPost(status)
);

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
      const result = await generatePdf(payload);
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
  async ({ to, subject, text }) => email({ to, subject, text })
);
mcpServer.tool(
  "editPDF",
  "Edit uploaded PDF and add text",
  {
    file: z.instanceof(Uint8Array),
    text: z.string(),
  },
  async ({ file, text }) => {
    const buffer = await editPDF(file, text);
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
  async ({ maxResults }) => list_events(maxResults)
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
    add_event(summary, description, startTime, endTime, location)
);

mcpServer.tool(
  "calendarViewDay",
  "View all events for a specific day",
  {
    date: z.string().describe("Date in YYYY-MM-DD format"),
  },
  async ({ date }) => view_day(date)
);

mcpServer.tool(
  "keepListNotes",
  "List notes from Google Keep",
  {},
  async () => keep_list_notes()
);

mcpServer.tool(
  "keepCreateNote",
  "Create a new note in Google Keep",
  {
    title: z.string().optional(),
    text: z.string(),
  },
  async ({ title, text }) => keep_add_note(title, text)
);

mcpServer.tool(
  "keepUpdateNote",
  "Update an existing note in Google Keep",
  {
    id: z.string().describe("The ID of the note to update"),
    title: z.string().optional().describe("New title for the note"),
    text: z.string().optional().describe("New text content for the note"),
  },
  async ({ id, title, text }) => keep_update_note(id, title, text)
);

mcpServer.tool(
  "keepArchiveNote",
  "Archive or unarchive a note in Google Keep",
  {
    id: z.string().describe("The ID of the note to archive"),
    archive: z.boolean().optional().default(true).describe("Whether to archive (true) or unarchive (false)"),
  },
  async ({ id, archive }) => keep_archive_note(id, archive)
);

mcpServer.tool(
  "keepDeleteNote",
  "Delete (move to trash) or restore a note in Google Keep",
  {
    id: z.string().describe("The ID of the note to delete"),
    delete: z.boolean().optional().default(true).describe("Whether to delete (true) or restore (false)"),
  },
  async ({ id, delete: delete_note }) => keep_delete_note(id, delete_note)
);

mcpServer.tool(
  "gitCheckStatus",
  "Check the current status of the git repository",
  {},
  async () => check_status()
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
    create_issue(owner, repo, title, body)
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
  async ({ count }) => list_commits(count)
);

mcpServer.tool(
  "gitCommitAll",
  "Stage all changes and commit them with a message",
  {
    message: z.string().describe("The commit message"),
  },
  async ({ message }) => commit_all(message)
);

mcpServer.tool(
  "gitPush",
  "Push the committed changes to the remote repository",
  {},
  async () => push()
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
    create_pull_request(owner, repo, title, body, head, base)
);

mcpServer.tool(
  "githubListIssues",
  "List issues for a specific GitHub repository",
  {
    owner: z.string(),
    repo: z.string(),
    state: z.enum(["open", "closed", "all"]).optional().default("open"),
  },
  async ({ owner, repo, state }) => list_issues(owner, repo, state)
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
    list_pull_requests(owner, repo, state)
);

mcpServer.tool(
  "githubGetRepoStats",
  "Get statistics like stars and forks for a repository",
  {
    owner: z.string(),
    repo: z.string(),
  },
  async ({ owner, repo }) => get_repo_stats(owner, repo)
);

mcpServer.tool(
  "githubGetUserProfile",
  "Get public profile information for a GitHub user",
  {
    username: z.string(),
  },
  async ({ username }) => get_user_profile(username)
);

// CONTENT SUMMARIZER TOOLS
mcpServer.tool(
  "youtubeGetTranscript",
  "Fetch the transcript/captions from a YouTube video URL. Use this to get the full text content of any YouTube video for summarization or analysis.",
  {
    url: z.string().url().describe("The YouTube video URL (supports youtube.com/watch, youtu.be, shorts, etc.)"),
  },
  async ({ url }) => fetch_transcript(url)
);

mcpServer.tool(
  "articleSummarize",
  "Fetch and extract the main content from an article or webpage URL. Removes navigation, ads, and other clutter to get the core text.",
  {
    url: z.string().url().describe("The article or webpage URL to extract content from"),
  },
  async ({ url }) => summarize_article(url)
);

mcpServer.tool(
  "extractKeyPoints",
  "Extract key takeaways and important points from text, a YouTube video, or an article URL. Returns content ready for AI summarization.",
  {
    input: z.string().describe("Either a URL (YouTube or article) or raw text to extract key points from"),
    numPoints: z.number().optional().default(5).describe("Number of key points to extract (default: 5)"),
  },
  async ({ input, numPoints }) => extract_key_points(input, numPoints)
);

// KROKI.IO TEXT TO DIAGRAM TOOL
mcpServer.tool(
  "textToDiagram",
  "Convert text descriptions to diagrams using Kroki.io. Supports multiple diagram types like Mermaid, PlantUML, GraphViz, Ditaa, Blockdiag, and more.",
  {
    text: z.string().describe("The diagram source text (e.g., Mermaid syntax, PlantUML code, DOT graph)"),
    diagramType: z.string().optional().default("mermaid").describe("Type of diagram: 'mermaid', 'plantuml', 'graphviz', 'ditaa', 'blockdiag', 'seqdiag', 'actdiag', 'nwdiag', 'c4plantuml', etc."),
    outputFormat: z.string().optional().default("png").describe("Output format: 'png', 'svg', or 'jpeg' (default: png)"),
  },
  async ({ text, diagramType, outputFormat }) => text_to_diagram(text, diagramType, outputFormat)
);

// LINKEDIN POST GENERATOR TOOLS (Direct API - No OAuth Flow Needed)
// User completes OAuth once manually, then uses access token forever

mcpServer.tool(
  "linkedinGetProfile",
  "Get the authenticated user's LinkedIn profile information. Verifies that the API connection is working.",
  {},
  async () => linkedin_get_profile()
);


// Direct Posting
mcpServer.tool(
  "linkedinPublishPost",
  "Publish a post directly to LinkedIn. Requires valid LINKEDIN_ACCESS_TOKEN in environment.",
  {
    content: z.string().describe("The full text content of the LinkedIn post to publish"),
    visibility: z.enum(["PUBLIC", "CONNECTIONS"]).optional().default("PUBLIC").describe("Who can see the post: PUBLIC (everyone) or CONNECTIONS (1st degree only)"),
  },
  async ({ content, visibility }) => publish_post(content, visibility)
);

mcpServer.tool(
  "linkedinPublishPostWithImage",
  "Publish a LinkedIn post with an image attachment. The image must be a publicly accessible URL.",
  {
    content: z.string().describe("The text content of the LinkedIn post"),
    imageUrl: z.string().url().describe("Public URL of the image to attach"),
    visibility: z.enum(["PUBLIC", "CONNECTIONS"]).optional().default("PUBLIC"),
  },
  async ({ content, imageUrl, visibility }) => publish_post_with_image(content, imageUrl, visibility)
);

// Content Generation
mcpServer.tool(
  "linkedinSearchPeople",
  "Search for professional information about people. Provides LinkedIn search guidance and recommendations.",
  {
    query: z.string().describe("Name or role of the person to search for (e.g., 'Elon Musk', 'tech startup founders')"),
    context: z.string().optional().describe("Additional context for the search"),
  },
  async ({ query, context }) => search_people_info(query, context)
);

mcpServer.tool(
  "linkedinDraftPost",
  "Draft an optimized LinkedIn post from an achievement or content. Can optionally auto-publish if LinkedIn API is configured.",
  {
    achievement: z.string().describe("The main content, achievement, or announcement to turn into a LinkedIn post"),
    context: z.string().optional().describe("Additional context or details to include"),
    tone: z.enum(["professional", "casual", "inspirational", "humble", "confident"]).optional().default("professional"),
    postType: z.enum(["auto", "achievement", "announcement", "thought_leadership", "lessons_learned", "celebration"]).optional().default("auto"),
    includeEmojis: z.boolean().optional().default(true),
    autoPublish: z.boolean().optional().default(false).describe("If true and LinkedIn API is configured, automatically publish the post"),
  },
  async ({ achievement, context, tone, postType, includeEmojis, autoPublish }) =>
    draft_linkedin_post(achievement, context, tone, postType, includeEmojis, autoPublish)
);

mcpServer.tool(
  "linkedinSuggestHashtags",
  "Suggest relevant hashtags for a LinkedIn post based on content and industry.",
  {
    content: z.string().describe("The LinkedIn post content or topic to generate hashtags for"),
    count: z.number().optional().default(10).describe("Number of hashtags to suggest"),
  },
  async ({ content, count }) => suggest_hashtags(content, count)
);

mcpServer.tool(
  "linkedinAnalyzeEngagement",
  "Analyze a LinkedIn post for engagement potential. Provides score, optimization tips, and best posting times.",
  {
    postContent: z.string().describe("The full LinkedIn post content to analyze"),
    targetAudience: z.string().optional().default("professionals"),
  },
  async ({ postContent, targetAudience }) => analyze_engagement(postContent, targetAudience)
);

