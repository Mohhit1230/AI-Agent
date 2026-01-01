import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import {
  Zap,
  Mail,
  Twitter,
  FileText,
  Search,
  Globe,
  Camera,
  ArrowLeft,
  ChevronRight,
  Shield,
  Cpu,
  Layers,
  Code2,
  Terminal,
  MousePointer2,
  StickyNote,
  Calendar,
  FolderOpen,
  Sparkles,
  Bot,
  Github,
  GitBranch,
  Workflow,
  Brain,
  RefreshCw,
  Youtube,
  BookOpen,
  ListChecks,
} from "lucide-react";

const featuresData = [
  {
    category: "Browser Automation",
    icon: MousePointer2,
    items: [
      {
        title: "Live Search",
        desc: "Real-time Google searches for up-to-date info.",
        icon: Search,
      },
      {
        title: "Web Navigation",
        desc: "Navigate and extract content from any URL.",
        icon: Globe,
      },
      {
        title: "Screenshots",
        desc: "Capture full-page visual documentation.",
        icon: Camera,
      },
    ],
    color: "emerald",
  },
  {
    category: "Productivity Suite",
    icon: StickyNote,
    items: [
      {
        title: "Google Keep",
        desc: "Create, update, and manage notes seamlessly.",
        icon: StickyNote,
      },
      {
        title: "Calendar Sync",
        desc: "Schedule meetings and view your day.",
        icon: Calendar,
      },
      {
        title: "File Operations",
        desc: "Read, write, and refactor local files.",
        icon: FolderOpen,
      },
    ],
    color: "blue",
  },
  {
    category: "Git & GitHub",
    icon: Github,
    items: [
      {
        title: "Repository Control",
        desc: "Commit, push, and manage branches.",
        icon: GitBranch,
      },
      {
        title: "Issue & PR Management",
        desc: "Create issues and pull requests.",
        icon: Workflow,
      },
      {
        title: "Profile Analytics",
        desc: "View repo stats and user profiles.",
        icon: Github,
      },
    ],
    color: "orange",
  },
  {
    category: "Content Summarizer",
    icon: Youtube,
    items: [
      {
        title: "YouTube Transcripts",
        desc: "Fetch full video transcripts instantly.",
        icon: Youtube,
      },
      {
        title: "Article Extraction",
        desc: "Extract main content from webpages.",
        icon: BookOpen,
      },
      {
        title: "Key Takeaways",
        desc: "Get important points from any content.",
        icon: ListChecks,
      },
    ],
    color: "red",
  },
  {
    category: "Documents & Comms",
    icon: FileText,
    items: [
      {
        title: "PDF Intelligence",
        desc: "Generate PDFs with smart previews.",
        icon: FileText,
      },
      {
        title: "Email Integration",
        desc: "Send emails directly via Gmail.",
        icon: Mail,
      },
      {
        title: "X (Twitter) Posts",
        desc: "Publish updates to your feed.",
        icon: Twitter,
      },
    ],
    color: "cyan",
  },
];

const About = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-content", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.utils.toArray(".animate-section").forEach((section) => {
        gsap.from(section, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
          },
        });
      });

      gsap.to(".feature-card", {
        scale: 1,
        opacity: 100,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.2)",
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-[#0b0c10] min-h-screen text-slate-300 selection:bg-emerald-500/30 font-mono overflow-x-hidden"
    >
      {/* Premium Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-orange-500/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Side Progress / Navigation (Desktop Only) */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 z-50">
        {["Mission", "Providers", "Workflow", "Features", "Stack"].map((label) => (
          <div
            key={label}
            className="group flex items-center gap-4 cursor-pointer"
          >
            <div className="h-[2px] w-4 bg-slate-700 group-hover:w-8 group-hover:bg-cyan-500 transition-all duration-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-cyan-400 transition-colors">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] w-full h-20 border-b border-white/5 bg-[#0b0c10]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-12">
        <div
          className="w-48 flex items-center gap-2 px-2 py-3 mb-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="absolute h-16 w-52 top-0 left-16 inset-0 bg-emerald-500/6 blur-md" />
          <img
            src="/logo2.webp"
            alt="Logo"
            className="w-full h-full object-cover relative z-10 brightness-110"
          />
        </div>

        <button
          onClick={() => navigate("/")}
          className="relative overflow-hidden group px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all"
        >
          <div className="relative z-10 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest text-white">
              Return home
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20 mt-20">
        {/* Hero Section */}
        <section className="mb-32">
          <div className="hero-content inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-10 hover:border-emerald-500/30 transition-colors">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Multi-Provider AI Engine
            </span>
          </div>

          <h1 className="hero-content text-6xl md:text-8xl font-sans font-black tracking-tight text-white mb-8 leading-[0.9]">
            Advanced <br /> AI{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Workspace.
            </span>
          </h1>

          <p className="hero-content max-w-2xl text-lg font-sans text-slate-400 leading-relaxed font-medium">
            Prosperity Agent is a unified intelligence layer built with the MERN
            stack. It transcends simple chat by integrating{" "}
            <span className="text-white">browser automation</span>,{" "}
            <span className="text-white">document generation</span>, and{" "}
            <span className="text-white">real-world actions</span> — powered by
            <span className="text-emerald-400"> OpenAI</span> with{" "}
            <span className="text-cyan-400">Gemini</span> fallback.
          </p>
        </section>

        {/* AI Providers Section */}
        <section className="mb-40 animate-section">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-white/5" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">
              AI Providers
            </h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OpenAI Card */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-2 bg-emerald-500/20 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Primary
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-emerald-500/10 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">OpenAI</h3>
                  <p className="text-sm text-emerald-400 font-bold">o3-mini</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                State-of-the-art language model with advanced reasoning, tool use,
                and complex task execution capabilities. Handles your primary requests
                with exceptional accuracy.
              </p>
            </div>

            {/* Gemini Card */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-2 bg-cyan-500/20 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-cyan-400">
                Fallback
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-cyan-500/10 group-hover:scale-110 transition-transform">
                  <RefreshCw className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Gemini</h3>
                  <p className="text-sm text-cyan-400 font-bold">2.5-flash-lite</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Google's multimodal AI serves as an intelligent fallback. Ensures
                uninterrupted service with seamless provider switching when needed,
                maintaining 99.9% uptime.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="mb-40 animate-section">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-white/5" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">
              How it Works
            </h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Analyze",
                icon: Search,
                desc: "AI interprets your intent through high-speed context analysis.",
              },
              {
                step: "02",
                title: "Strategy",
                icon: Cpu,
                desc: "The system selects the optimal tool sequence (MCP) for the task.",
              },
              {
                step: "03",
                title: "Execute",
                icon: Terminal,
                desc: "Real-time browser or file operations are triggered via backend.",
              },
              {
                step: "04",
                title: "Deliver",
                icon: Zap,
                desc: "Rich results are rendered instantly with full interactive power.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all duration-500"
              >
                <span className="text-4xl font-black text-white/5 group-hover:text-emerald-500/20 transition-colors mb-6 block font-mono">
                  {item.step}
                </span>
                <item.icon className="h-6 w-6 text-emerald-500 mb-4 group-hover:-translate-y-1 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Matrix Section */}
        <section className="mb-40 animate-section">
          <div className="mb-16">
            <h2 className="text-4xl font-black tracking-tighter text-white mb-4">
              Core Ecosystem
            </h2>
            <p className="text-slate-500 font-medium">
              36+ tools built to handle complex automation without missing a beat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {featuresData.map((cat, i) => (
              <div key={i} className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${cat.color === "emerald"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : cat.color === "blue"
                        ? "bg-blue-500/10 text-blue-400"
                        : cat.color === "orange"
                          ? "bg-orange-500/10 text-orange-400"
                          : cat.color === "red"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-cyan-500/10 text-cyan-400"
                      }`}
                  >
                    <cat.icon className="h-5 w-5 animate-pulse" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                    {cat.category}
                  </h3>
                </div>

                <div className="space-y-3">
                  {cat.items.map((item, j) => (
                    <div
                      key={j}
                      className="feature-card h-32 scale-90 opacity-0 group relative p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                    >
                      <div className="scanner-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full" />

                      <div className="relative z-10">
                         <div
                    className={` ${cat.color === "emerald"
                      ? "text-emerald-500/50 group-hover:text-emerald-400"
                      : cat.color === "blue"
                        ? "text-blue-500/50 group-hover:text-blue-400"
                        : cat.color === "orange"
                          ? "text-orange-500/50 group-hover:text-orange-400"
                          : cat.color === "red"
                            ? "text-red-500/50 group-hover:text-red-400"
                            : "text-cyan-500/50 group-hover:text-cyan-400"
                      }`}
                  >
                    <item.icon className="h-4 w-4 group-hover:scale-110 transition-all mb-2" />
                  </div>
                        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                          {item.desc}
                        </p>
                      </div>

                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-500 opacity-50" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Layout */}
        <section className="animate-section mb-40 p-12 rounded-[2.5rem] group border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-emerald-500 mb-4 font-mono text-xs">
                <Code2 className="h-4 w-4" />
                <span>$ system.info --tech-stack</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-6">
                Built for Performance.
              </h2>
              <ul className="space-y-3 text-sm text-slate-400 font-medium">
                <li className="flex items-center gap-3">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                  Frontend: React + Vite + TailwindCSS 4
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                  Backend: Node.js + Express + MCP Server
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                  Primary AI: OpenAI o3-mini
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1 w-1 bg-cyan-500 rounded-full" />
                  Fallback AI: Google Gemini-2.5-Flash
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                  Automation: Playwright & Python Scripts
                </li>
              </ul>
            </div>

            <div className="relative">
              
              <div className="relative p-4 py-3 rounded-3xl  border border-cyan-500/50 bg-cyan-500/5 group-hover:border-cyan-500/0 group-hover:bg-emerald-950/0 transition-all duration-500 scale-110">
                <img
                  src="/logo1.webp"
                  alt=""
                  className="w-80 h-full object-cover brightness-110"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Author / Footer */}
        <section className="animate-section text-center pt-20 border-t border-white/5">
          <p className="text-xs font-black uppercase tracking-[0.6em] text-slate-600 mb-8">
            Developed by
          </p>
          <a
            href="https://github.com/Mohhit1230"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all"
          >
            <img
              src="https://github.com/Mohhit1230.png"
              alt="Mohhit"
              className="h-10 w-10 rounded-full border-2 border-slate-800"
            />
            <div className="text-left">
              <span className="block text-sm font-black text-white tracking-widest uppercase">
                Mohhit1230
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                GitHub Contributor
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-cyan-500 group-hover:translate-x-1 transition-transform" />
          </a>
        </section>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .feature-card:hover .scanner-shimmer {
            animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </div>
  );
};

export default About;
