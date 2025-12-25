/* eslint-disable no-unused-vars */
// FeaturesPanel.jsx
// import React from "react";
import { Mail, FileText, Twitter, Calculator, Zap, Globe, Camera, Search, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"

const features = [
  { icon: Mail, title: "Send Emails", subtitle: "Draft & deliver fast" },
  { icon: Twitter, title: "Post on Twitter (X)", subtitle: "Compose & schedule" },
  { icon: FileText, title: "Generate PDF", subtitle: "Produce pdfs quickly" },
  { icon: StickyNote, title: "Google Keep", subtitle: "Manage your notes" },
  { icon: Search, title: "Browser Search", subtitle: "Search the web live" },
  { icon: Globe, title: "Navigate Sites", subtitle: "Browse and extract data" },
  { icon: Camera, title: "Take Screenshot", subtitle: "Capture web pages" },
];


const FeaturesPanel = ({ drawer }) => {
  return (
    <div className="sticky top-28">
      <Card className={`rounded-2xl ${drawer === "drawer" ? "bg-[#212121]" : "bg-white/5"} `}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Zap className="h-4 w-4 text-amber-400" />
            What more I can do
          </CardTitle>
          <p className="text-xs text-neutral-400">Explore quick actions and tools</p>
        </CardHeader>
        <CardContent className="grid gap-2">

          {features.map(({ icon: Icon, title, subtitle }) => (
            <button
              key={title}
              className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-[#101318]/70 p-3 text-left transition hover:border-emerald-500/30 hover:bg-[#11161d]"
            >
              <Icon className="mt-0.5 h-4 w-4 text-neutral-300" />
              <div className="flex-1">
                <div className="text-sm text-white">{title}</div>
               
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesPanel;
