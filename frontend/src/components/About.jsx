import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const featuresData = [
  {
    category: "Playwright Automation",
    icon: MousePointer2,
    items: [
      {
        title: "Live Search",
        desc: "Real-time Google searches for up-to-date info.",
        icon: Search,
      },
      {
        title: "Web Navigation",
        desc: "Extract content from any URL with precision.",
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
    category: "Productivity Tools",
    icon: StickyNote,
    items: [
      {
        title: "Google Keep",
        desc: "Log ideas and capture links into your workspace.",
        icon: StickyNote,
      },
      {
        title: "Calendar Sync",
        desc: "Schedule meetings and view your day at a glance.",
        icon: Calendar,
      },
      {
        title: "File Operations",
        desc: "Analyze local projects and suggest refactors.",
        icon: FolderOpen,
      },
    ],
    color: "blue",
  },
  {
    category: "Intelligence & Docs",
    icon: Sparkles,
    items: [
      {
        title: "PDF Intelligence",
        desc: "Instant generation and smart built-in previews.",
        icon: FileText,
      },
      {
        title: "X Interaction",
        desc: "Automated social media posting and tracking.",
        icon: Twitter,
      },
      {
        title: "Summary Engine",
        desc: "Extract key takeaways from long reads/videos.",
        icon: FileText,
      },
    ],
    color: "purple",
  },
];

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
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Immediate Hero Animation
      gsap.from(".hero-content", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
      });

      // Entrance animation for sections
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

      // Card entrance animation with stagger
      gsap.to(".feature-card", {
        scale: 1,
        opacity: 100,
        duration: 0.8,
        stagger: 0.2,
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
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Side Progress / Navigation (Desktop Only) */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 z-50">
        {["Mission", "Workflow", "Features", "Stack"].map((label, i) => (
          <div
            key={label}
            className="group flex items-center gap-4 cursor-pointer"
          >
            <div className="h-[2px] w-4 bg-slate-700 group-hover:w-8 group-hover:bg-emerald-500 transition-all duration-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-emerald-400 transition-colors">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] w-full h-20 border-b border-white/5 bg-[#0b0c10]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-12">
        <div
          className="w-48 flex items-center gap-2 px-2 py-3 mb-2"
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
              Powered by Gemini 2.5 Flash
            </span>
          </div>

          <h1 className="hero-content text-6xl md:text-8xl font-sans  font-black tracking-tight text-white mb-8 leading-[0.9]">
            Advanced <br /> AI{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Workspace.
            </span>
          </h1>

          <p className="hero-content max-w-2xl text-lg font-sans text-slate-400 leading-relaxed font-medium">
            Prosperity Agent is a unified intelligence layer built with the MERN
            stack. It transcends simple chat by integrating{" "}
            <span className="text-white">browser automation</span>,
            <span className="text-white">document generation</span>, and{" "}
            <span className="text-white">real-world actions</span> into one
            seamless workflow.
          </p>
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
                desc: "Gemini interprets your intent through high-speed context analysis.",
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
              Built to handle complex automation without missing a beat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuresData.map((cat, i) => (
              <div key={i} className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-${cat.color}-500/10 text-${cat.color}-400`}
                  >
                    <cat.icon className="h-5 w-5 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">
                    {cat.category}
                  </h3>
                </div>

                <div className="space-y-4">
                  {cat.items.map((item, j) => (
                    <div
                      key={j}
                      className="feature-card scale-75 opacity-0 group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Scanner Shimmer Effect - Raw CSS class */}
                      <div className="scanner-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full" />

                      <div className="relative z-10">
                        <item.icon className="h-4 w-4 text-emerald-500/50 group-hover:text-emerald-400 group-hover:scale-110 transition-all mb-3 group-hover:rotate-12" />
                        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed group-hover:text-slate-400 transition-colors">
                          {item.desc}
                        </p>
                      </div>

                      {/* Bottom Glow */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-500 opacity-50" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Layout */}
        <section className="animate-section mb-40 p-12 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/5 to-purple-500/5 border border-white/5 relative overflow-hidden group">
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
                  Frontend: React + Vite + Tailwind 4
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                  Backend: Node.js + Express + MCP
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                  Engine: Google Gemini-2.5-Flash
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                  Automation: Playwright & Python Scripts
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] animate-pulse" />
              <div className="relative p-8 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl scale-110">
                <img
                  src="/logo2.webp"
                  alt=""
                  className="w-60 h-full object-cover brightness-110"
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
            className="group relative inline-flex items-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
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
            <ChevronRight className="h-4 w-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
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
        .bg-emerald-500\\/10 { background-color: rgba(16, 185, 129, 0.1); }
        .text-emerald-400 { color: rgb(52, 211, 153); }
        .text-emerald-500 { color: rgb(16, 185, 129); }
        .bg-blue-500\\/10 { background-color: rgba(59, 130, 246, 0.1); }
        .text-blue-400 { color: rgb(96, 165, 250); }
        .bg-purple-500\\/10 { background-color: rgba(168, 85, 247, 0.1); }
        .text-purple-400 { color: rgb(192, 132, 252); }
      `,
        }}
      />
    </div>
  );
};

export default About;
