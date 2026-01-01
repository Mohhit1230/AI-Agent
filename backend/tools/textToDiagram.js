import axios from "axios";

/**
 * Convert text to diagram using Kroki.io service
 * Supports multiple diagram types: plantuml, mermaid, graphviz, etc.
 * 
 * @param {string} text - The diagram source text
 * @param {string} diagramType - Type of diagram (plantuml, mermaid, graphviz, etc.)
 * @param {string} outputFormat - Output format (png, svg, jpeg) - default: png
 * @returns {object} MCP result with diagram data
 */
export async function text_to_diagram(text, diagramType = "mermaid", outputFormat = "png") {
    try {
        // Kroki.io endpoint
        const url = `https://kroki.io/${diagramType}/${outputFormat}`;

        // Send diagram text to Kroki
        const response = await axios.post(url, text, {
            headers: {
                "Content-Type": "text/plain",
            },
            responseType: "arraybuffer", // Get image as buffer
        });

        // Convert to base64
        const base64Image = Buffer.from(response.data, "binary").toString("base64");
        const mimeType = outputFormat === "svg" ? "image/svg+xml" : `image/${outputFormat}`;

        return {
            content: [
                {
                    type: "image",
                    data: base64Image,
                    mimeType: mimeType,
                },
                {
                    type: "text",
                    text: `✅ Successfully generated ${diagramType} diagram in ${outputFormat} format using Kroki.io`,
                },
            ],
        };
    } catch (error) {
        console.error("❌ Kroki.io diagram generation failed:", error.message);
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Failed to generate diagram: ${error.message}\n\nTip: Make sure the diagram syntax is valid for ${diagramType}.`,
                },
            ],
        };
    }
}
