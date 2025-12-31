import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, "..", "Python", "keep_ops.py");

function runKeepOp(op, params = null) {
    return new Promise((resolve, reject) => {
        const args = [SCRIPT_PATH, op];
        if (params) {
            args.push(JSON.stringify(params));
        }

        const pyProcess = spawn("python", args);

        let output = "";
        let errorOutput = "";

        pyProcess.stdout.on("data", (data) => (output += data.toString()));
        pyProcess.stderr.on("data", (err) => (errorOutput += err.toString()));

        pyProcess.on("close", (code) => {
            // Check if stdout contains a JSON error message even if code is non-zero
            try {
                if (output.trim()) {
                    const result = JSON.parse(output);
                    if (result.error) {
                        return resolve({
                            content: [{ type: "text", text: `❌ ${result.error}` }]
                        });
                    }
                }
            } catch (e) {
                // Not JSON, continue to normal error handling
            }

            if (code !== 0) {
                console.error("Keep API Error:", errorOutput);
                return resolve({
                    content: [{ type: "text", text: `❌ Keep operation failed: ${errorOutput || "Unknown error (Check your credentials and 2-step verification status)"}` }]
                });
            }

            try {
                const result = JSON.parse(output);
                if (result.error) {
                    return resolve({
                        content: [{ type: "text", text: `❌ ${result.error}` }]
                    });
                }

                let textResponse = "";
                if (op === "list") {
                    textResponse = Array.isArray(result)
                        ? result.map(n => `ID: ${n.id}\nTitle: ${n.title}\nContent: ${n.text}\nLabels: ${n.labels.join(", ")}\n---`).join("\n")
                        : "No notes found.";
                } else {
                    textResponse = `✅ Operation ${op} successful.\n${JSON.stringify(result, null, 2)}`;
                }

                resolve({
                    content: [{ type: "text", text: textResponse }]
                });
            } catch (err) {
                console.error("JSON parse error:", err, output);
                resolve({
                    content: [{ type: "text", text: "❌ Failed to parse response from Keep API" }]
                });
            }
        });
    });
}

export const keep_list_notes = () => runKeepOp("list");
export const keep_add_note = (title, text) => runKeepOp("add", { title, text });
export const keep_update_note = (id, title, text) => runKeepOp("update", { id, title, text });
export const keep_archive_note = (id, archive = true) => runKeepOp("archive", { id, archive });
export const keep_delete_note = (id, delete_note = true) => runKeepOp("delete", { id, delete: delete_note });
