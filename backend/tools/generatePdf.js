import { fileURLToPath } from "url";
import { spawn } from "child_process";
import PDFDocument from "pdfkit";
import path from "path";

export function generatePdf(content) {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const scriptPath = path.join(__dirname,"..", "Python", "pdf.py");

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





export async function editPDF(fileBuffer, newText) {
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