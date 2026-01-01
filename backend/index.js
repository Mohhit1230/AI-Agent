import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { mcpServer } from "./config/mcpServer.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import multer from "multer";
// import { Buffer } from "buffer";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";
import { callAIWithFallback } from "./callModels.js";

dotenv.config();
const app = express();


app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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
import "./mcp.tool.js";
const transports = {};



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

// app.post("/upload-pdf", upload.single("file"), async (req, res) => {
//   const editedBuffer = await editExistingPDF(
//     req.file.buffer,
//     "Injected from upload 🚀"
//   );
//   res.set({
//     "Content-Type": "application/pdf",
//     "Content-Disposition": "attachment; filename=edited.pdf",
//   });
//   res.send(Buffer.from(editedBuffer));
// });

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



const mcpClient = new Client({ name: "client-proxy", version: "1.0.0" });

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
