// import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { z } from "zod";
// import {
//   createPost,
//   sendEmail,
//   generatePDFfromText,
//   editExistingPDF,
//   godaddy_login,
//   generatePDF,
// } from "./mcp.tool.js";
// import multer from "multer";
// import { Buffer } from "buffer";
// const mcpServer = new McpServer({ name: "unified-server", version: "1.0.0" });

// const tools = () => ({
//         mcpServer.tool(
//           "addTwoNumbers",
//           "Add two numbers",
//           {
//             a: z.number(),
//             b: z.number(),
//           },
//           async ({ a, b }) => ({
//             content: [{ type: "text", text: `Sum is ${a + b}` }],
//           })
//         );
        
//         mcpServer.tool(
//           "calculate-bmi",
//           "BMI Calculator",
//           {
//             weightKg: z.number(),
//             heightM: z.number(),
//           },
//           async ({ weightKg, heightM }) => ({
//             content: [{ type: "text", text: `${weightKg / (heightM * heightM)}` }],
//           })
//         );
        
        
//         mcpServer.tool(
//           "createPost",
//           "Post on X",
//           {
//             status: z.string(),
//           },
//           async ({ status }) => createPost(status)
//         );
//         mcpServer.tool(
//           "godaddyLogin",
//           "It will login to godaddy",
//           {},
//           async () => godaddy_login()
//         );
        
        
//         // mcpServer.tool(
//         //   "divetopool",
//         //   "dive into pool with content",
//         //   {
//         //     text: z.string(),
//         //   },
//         //   async ({ text }) => {
//         //     // Wrap in list so Python gets [{"type": "text", "text": "..."}]
//         //     const payload = JSON.stringify([{ type: "text", text }]);
//         //     return await generatePDF(payload);
//         //   }
//         // );
        
        
//         mcpServer.tool(
//           "divetopool",
//           "Generate a PDF from text",
//           {
//             text: z.string(),
//           },
//           async ({ text }) => {
//             // Wrap text in array as expected by Python: [{"type":"text","text":"..."}]
//             const payload = JSON.stringify([{ type: "text", text }]);
//             try {
//               const result = await generatePDF(payload);
//               return result; // MCP expects { content: [...] }
//             } catch (err) {
//               console.error("Error generating PDF:", err);
//               return {
//                 content: [
//                   {
//                     type: "text",
//                     text: "❌ Failed to generate PDF",
//                   },
//                 ],
//               };
//             }
//           }
//         );
        
        
        
//         mcpServer.tool(
//           "sendEmail",
//           "Send an Email",
//           {
//             to: z.string(),
//             subject: z.string(),
//             text: z.string(),
//           },
//           async ({ to, subject, text }) => sendEmail({ to, subject, text })
//         );
        
//         mcpServer.tool(
//           "generatePdf",
//           "Generate a PDF from plain text",
//           {
//             text: z.string(),
//           },
//           async ({ text }) => {
//             if (typeof text !== "string" || !text.trim()) {
//               throw new Error("Text input is required to generate a PDF.");
//             }
//             const buffer = await generatePDFfromText(text);
//             if (!buffer || !Buffer.isBuffer(buffer)) {
//               throw new Error("PDF generation failed. Buffer is invalid.");
//             }
        
//             const base64 = buffer.toString("base64"); 
//             const downloadUrl = `data:application/pdf;base64,${base64}`;
//             const fileName = `${Date.now()}.pdf`;
        
//             return {
//               content: [
//                 {
//                   type: "resource_link",
//                   uri: downloadUrl,
//                   name: fileName,
//                   mimeType: "application/pdf",
//                   description: "Generated PDF file",
//                 },
//               ],
//             };
//           }
//         );
//         mcpServer.tool(
//           "editPDF",
//           "Edit uploaded PDF and add text",
//           {
//             file: z.instanceof(Uint8Array), 
//             text: z.string(),
//           },
//           async ({ file, text }) => {
//             const buffer = await editExistingPDF(file, text);
//             return {
//               content: [{ type: "file_data", name: "edited.pdf", data: buffer }],
//             };
//           }
//         );
//         // MCP server SSE route
//         app.get("/sse", async (req, res) => {
//           const transport = new SSEServerTransport("/messages", res);
//           transports[transport.sessionId] = transport;
        
//           req.on("close", () => {
//             delete transports[transport.sessionId];
//             console.log(`❌ Disconnected ${transport.sessionId}`);
//           });
        
//           await mcpServer.connect(transport);
//         });
        
//         app.post("/upload-pdf", upload.single("file"), async (req, res) => {
//           const editedBuffer = await editExistingPDF(
//             req.file.buffer,
//             "Injected from upload 🚀"
//           );
//           res.set({
//             "Content-Type": "application/pdf",
//             "Content-Disposition": "attachment; filename=edited.pdf",
//           });
//           res.send(Buffer.from(editedBuffer));
//         })
//     }
// )
// export default tools;