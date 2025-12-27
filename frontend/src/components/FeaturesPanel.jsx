/* eslint-disable no-unused-vars */
// FeaturesPanel.jsx
// import React from "react";
import { Mail, FileText, Twitter, Calculator, Zap, Globe, Camera, Search, StickyNote, Calendar, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"

const features = [
  {
    icon: Mail,
    title: "Send Emails",
    subtitle: "Draft & deliver fast",
    description: "Send professional emails directly to any recipient."
  },
  {
    icon: Twitter,
    title: "Post on X",
    subtitle: "Compose & schedule",
    description: "Post updates and tweets to your connected X (Twitter) account."
  },
  {
    icon: FileText,
    title: "Generate PDF",
    subtitle: "Produce pdfs quickly",
    description: "Convert text or summaries into formal PDF documents."
  },
  {
    icon: StickyNote,
    title: "Google Keep",
    subtitle: "Manage your notes",
    description: "Create, read, and manage your Google Keep notes in the browser."
  },
  {
    icon: Calendar,
    title: "Google Calendar",
    subtitle: "Manage your schedule",
    description: "View your day, list events, and add new meetings to your calendar."
  },
  {
    icon: FolderOpen,
    title: "Local File System",
    subtitle: "Read & write code",
    description: "Analyze local project files, list directories, and refactor code snippets."
  },
  {
    icon: Search,
    title: "Browser Search",
    subtitle: "Search the web live",
    description: "Search Google for live information and research data."
  },
  {
    icon: Globe,
    title: "Navigate Sites",
    subtitle: "Browse and extract data",
    description: "Visit any URL to browse content or perform automated actions."
  },
  {
    icon: Camera,
    title: "Take Screenshot",
    subtitle: "Capture web pages",
    description: "Take high-quality snapshots of active browser pages."
  },
];


const FeaturesPanel = ({ drawer }) => {
  return (
    <div className="sticky top-28 space-y-2">
      <Card className={`overflow-hidden border-none transition-all duration-500 ${drawer === "drawer" ? "bg-[#1a1c20]" : "bg-[#0d0f13]/40 backdrop-blur-2xl"
        } shadow-[0_0_40px_-15px_rgba(16,185,129,0.1)]`}>

        <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500" />

        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-white">
            <div className="relative">
              <Zap className="h-4 w-4 text-emerald-400" />
              <div className="absolute inset-0 h-4 w-4 bg-emerald-400 blur-lg opacity-30" />
            </div>
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Capabilities
            </span>
          </CardTitle>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-500/70">
            Agentic Tools
          </p>
        </CardHeader>

        <CardContent className="grid gap-1.5 px-3 pb-4">
          {features.map(({ icon: Icon, title, subtitle, description }, index) => (
            <div key={title} className="group relative">
              <button
                title={description}
                className="relative z-10 flex w-full items-center gap-2.5 rounded-xl border border-white/[0.02] bg-white/[0.01] p-2 text-left transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.03] active:scale-[0.98]"
              >
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-bold text-white/80 group-hover:text-white">
                      {title}
                    </span>
                    {(title.includes("Calendar") || title.includes("File")) && (
                      <span className="shrink-0 rounded-full bg-emerald-500/20 px-1 py-0.5 text-[7px] font-black uppercase text-emerald-400">
                        New
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[9px] text-neutral-500 group-hover:text-neutral-400">
                    {subtitle}
                  </div>
                </div>
              </button>

              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500/0 to-cyan-500/0 opacity-0 blur-sm transition-all duration-500 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 group-hover:opacity-100" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesPanel;
