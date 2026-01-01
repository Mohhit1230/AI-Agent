import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize all AI providers
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const geminiAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


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


// OpenAI Provider
async function callOpenAI(messages, tools, mcpClientRef) {
    if (!openaiClient) throw new Error("OpenAI not configured");

    const openaiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...convertMessagesForOpenAI(messages),
    ];
    const toolsResponse = await mcpClientRef.listTools();
    const openaiTools = convertToolsForOpenAI(toolsResponse.tools);

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
    const toolsResponse = await mcpClientRef.listTools();
    const geminiTools = convertToolsForGemini(toolsResponse.tools);

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

        const model = geminiAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || "gemini-2.0-flash", // Use correct model name
            tools: geminiTools.length > 0 ? [{ functionDeclarations: geminiTools }] : undefined,
        });

        const result = await model.generateContent({
            contents: currentMessages,
        });

        const response = await result.response;
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

// Main AI caller with fallback: OpenAI → Gemini
export async function callAIWithFallback(messages, mcpClientRef) {
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




