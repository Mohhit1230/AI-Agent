# Prosperity Agent 🤖 - Advanced AI Workspace

Prosperity Agent is a powerful, unified AI assistant built with the MERN stack architecture, leveraging **Google Gemini 2.5 Flash** and the **Model Context Protocol (MCP)**. It goes beyond simple chat by integrating browser automation, email delivery, social media posting, and document generation into a sleek, premium interface.

---

## 🚀 Key Features

### 🌐 Playwright Browser Automation
The agent can interact with the live web using Playwright. It can search, navigate, and even handle complex tasks like ordering products or extracting data.
- **Live Search:** Perform real-time Google searches to get up-to-date information.
- **Web Navigation:** Navigate to any URL and extract page content.
- **Screenshots:** Capture full-page screenshots of websites.

### 📄 Document & PDF Intelligence
- **PDF Generation:** Instantly convert text or web data into professionally formatted PDF documents.
- **Smart Previews:** View generated PDFs directly within the chat interface using the built-in PDF viewer.
- **Resource Linking:** Download links are provided for every generated file.

### 📧 Communication & Socials
- **Direct Emailing:** Send emails via Gmail integration with custom subjects and bodies.
- **Twitter (X) Integration:** Post updates directly to your X account through the AI.

### 🖼️ Interactive Media Handling
- **Full-Screen Previews:** Click any screenshot or image to view it in a premium full-screen modal with blur-backdrop effects.
- **Image Downloads:** Quick download links for all visual assets generated during the session.

### 🛠️ Developer-First Chat Experience
- **Markdown Support:** Full syntax highlighting for over 100+ languages.
- **Message Management:** Delete individual messages or clear entire histories.
- **Copy Actions:** One-click copying for all code snippets and text responses.

---

## 📸 Screenshots

| Feature | Preview |
| :--- | :--- |
| **Web Browser Interface** | ![Browser Automation](docs/images/browser_automation.png) |
| **PDF Extraction** | ![PDF Generation](docs/images/pdf_gen.png) |
| **PDF Preview** | ![PDF Previewer](docs/images/pdf_preview.png) |
| **Email Integration** | ![Email System](docs/images/email_system.png) |

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (for some background processing tools)
- API Keys: Google Gemini, Twitter (X) API, and Gmail App Password.

### 1. Clone the Repository
```bash
git clone https://github.com/Mohhit1230/AI-Agent.git
cd AI-Agent
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_key
   TWITTER_API_KEY=your_x_api_key
   TWITTER_API_SECRET=your_x_api_secret
   TWITTER_ACCESS_TOKEN=your_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_token_secret
   HOST_EMAIL=your_gmail@gmail.com
   HOST_PASSWORD=your_app_password
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm run dev  # or node index.js
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:4000
   ```
4. Launch the application:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

- **`/frontend`**: React + Vite application with TailwindCSS and GSAP animations.
- **`/backend`**: Express server acting as an MCP host and proxy for the Gemini API.
- **`/backend/mcp.tool.js`**: Core logic for browser automation, email, and document tools.
- **`/backend/Python`**: Helper scripts for specialized tasks like PDF generation.

---

## 🧪 How it Works

1. **User input** is sent to the backend proxy.
2. **Gemini 2.5 Flash** analyzes the request and decides if a "tool" (MCP) is needed.
3. The **MCP Client** triggers the appropriate tool (e.g., Playwright for browsing).
4. The tool result is processed and sent back to the **Frontend** for rich rendering (Markdown, PDF frames, or Images).

---

## 📜 License
This project is for educational purposes. Built by [Mohhit1230](https://github.com/Mohhit1230).
