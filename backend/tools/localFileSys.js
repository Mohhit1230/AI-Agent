import fs from "fs/promises";
import path from "path";





export async function read_file(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return {
      content: [
        {
          type: "text",
          text: `File content of ${filePath}:\n\n${data}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error reading file ${filePath}: ${error.message}`,
        },
      ],
    };
  }
}

export async function update_code(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, "utf-8");
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully updated file: ${filePath}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error updating file ${filePath}: ${error.message}`,
        },
      ],
    };
  }
}

export async function list_files(dirPath) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const fileList = files
      .map((f) => `${f.isDirectory() ? "📁" : "📄"} ${f.name}`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `Files in ${dirPath}:\n\n${fileList}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error listing directory ${dirPath}: ${error.message}`,
        },
      ],
    };
  }
}
