import {
  Search,
  Calendar,
  FileText,
  Mail,
  Twitter,
  Github,
  Globe,
  Camera,
  FolderOpen,
  Zap,
  Sparkles,
  ArrowRight,
  StickyNote,
  Bot,
  Youtube,
  BookOpen,
} from "lucide-react";

const quickActions = [
  { icon: Search, label: "Search the web", prompt: "Search for latest AI news" },
  { icon: Youtube, label: "Summarize video", prompt: "Summarize this YouTube video" },
  { icon: FileText, label: "Generate PDF", prompt: "Create a PDF summary of..." },
  { icon: Calendar, label: "Check calendar", prompt: "What's on my schedule today?" },
  { icon: Github, label: "GitHub actions", prompt: "Check my repo status" },
  { icon: StickyNote, label: "Take notes", prompt: "Add a note to my Keep" },
];

const NewChatScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-slide-up">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
          Multi-Provider AI • OpenAI + Gemini
        </span>
      </div>

      {/* Main Title */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl opacity-50" />
        <h1 className="relative text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Prosmic
          </span>
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-base md:text-lg text-neutral-400 max-w-lg mb-10 font-medium leading-relaxed">
        Your unified AI workspace with{" "}
        <span className="text-white">browser automation</span>,{" "}
        <span className="text-white">content summarization</span>, and{" "}
        <span className="text-white">smart productivity tools</span>.
      </p>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl mb-10">
        {quickActions.map((action, i) => (
          <button
            key={i}
            className="group flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.06] transition-all duration-300 text-left"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Suggestion Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 mr-2">
          Try asking:
        </span>
        {[
          "Summarize this YouTube video",
          "What are the key takeaways?",
          "Extract article content",
        ].map((suggestion, i) => (
          <button
            key={i}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Capability Icons */}
      <div className="flex items-center gap-6 opacity-40">
        {[Globe, Youtube, FileText, Calendar, Github, Mail, BookOpen].map(
          (Icon, i) => (
            <Icon key={i} className="h-4 w-4 text-neutral-500" />
          )
        )}
      </div>

      {/* Bottom Hint */}
      <div className="mt-10 flex items-center gap-2 text-xs text-neutral-500">
        <Bot className="h-3.5 w-3.5" />
        <span>Powered by OpenAI o3-mini + Gemini 2.5 Flash</span>
      </div>
    </div>
  );
};

export default NewChatScreen;
