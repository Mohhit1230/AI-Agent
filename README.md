# Prosperity Agent 🤖 - Advanced AI Workspace

Prosperity Agent is a powerful, unified AI assistant built with the MERN stack architecture, leveraging **Google Gemini 2.5 Flash** and the **Model Context Protocol (MCP)**. It goes beyond simple chat by integrating browser automation, email delivery, social media posting, document generation, and full **GitHub/Git workspace management** into a sleek, premium interface.

---

## 🚀 Key Features

### 🌐 Playwright Browser Automation
The agent can interact with the live web using Playwright. It can search, navigate, and even handle complex tasks like ordering products or extracting data.
- **Live Search:** Perform real-time Google searches to get up-to-date information.
- **Web Navigation:** Navigate to any URL and extract page content.
- **Screenshots:** Capture full-page screenshots of websites.

### 🚀 GitHub & Git Assistant (New! ✅)
Seamlessly manage your codebase and remote repositories directly from the chat.
- **Local Git Control:** Check status, stage changes, commit with AI-generated messages, and push to remote.
- **GitHub Intelligence:** Create issues, list pull requests, and analyze repository statistics/stars.
- **Profile Insights:** Fetch information about any GitHub user or organization instantly.

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

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (for some background processing tools)
- API Keys: Google Gemini, GitHub Token, Twitter (X) API, and Gmail App Password.

### 1. Clone the Repository
```bash
git clone https://github.com/Mohhit6075/AI-Agent.git
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
   # Core AI
   GEMINI_API_KEY=your_gemini_key
   
   # GitHub Integration
   GITHUB_TOKEN=your_personal_access_token
   
   # Social & Communication
   TWITTER_API_KEY=your_x_api_key
   TWITTER_API_SECRET=your_x_api_secret
   TWITTER_ACCESS_TOKEN=your_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_token_secret
   HOST_EMAIL=your_gmail@gmail.com
   HOST_PASSWORD=your_app_password
   
   # Server Config
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm run dev  # or node index.js
   ```

---

## 📂 Project Structure

- **`/frontend`**: React + Vite application with TailwindCSS and GSAP animations.
- **`/backend`**: Express server acting as an MCP host and proxy for the Gemini API.
- **`/backend/mcp.tool.js`**: Core logic for browser automation, email, GitHub, and document tools.
- **`/backend/Python`**: Helper scripts for specialized tasks like PDF generation.

---

## 🧪 How it Works

1. **User input** is sent to the backend proxy.
2. **Gemini 2.5 Flash** analyzes the request and decides if a "tool" (MCP) is needed.
3. The **MCP Client** triggers the appropriate tool (e.g., Playwright for browsing or Git for local commits).
4. The tool result is processed and sent back to the **Frontend** for rich rendering (Markdown, PDF frames, or dynamic images).

---

## 📜 License
This project is for educational purposes. Built by [Mohhit6075](https://github.com/Mohhit6075).
