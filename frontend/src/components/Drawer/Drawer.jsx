import React, { useState, useEffect } from "react";
import {
  Menu,
  Zap,
  Mail,
  FileText,
  Twitter,
  Calculator,
  Globe,
  Camera,
  Search
} from "lucide-react";
import { Options } from "../Options";

const drawerFeatures = [
  { icon: Mail, title: "Email" },
  { icon: Twitter, title: "Twitter" },
  { icon: FileText, title: "PDF Generate" },
  { icon: Search, title: "Search results" },
  { icon: Globe, title: "Navigate to urls" },
  { icon: Camera, title: "Snapshot of webpage" },
];

const DrawerBasic = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 px-5 transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
      >
        <Menu className="h-5 w-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-medium text-white/90">Menu</span>
      </button>

      

      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-screen flex justify-between h-screen transform  border-r border-white/10 shadow-2xl transition-transform duration-200 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="h-full w-[560px] flex flex-col pt-8 bg-[#0d0f13]">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-6">
            <div className="space-y-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 pl-1">
                Chat options
              </div>
              <Options method={() => setIsOpen(false)} />
            </div>

            <div className="space-y-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 pl-1">
                Quick Tools
              </div>
              <div className="grid grid-cols-1 gap-2">
                {drawerFeatures.map(({ icon: Icon, title }) => (
                  <button
                    key={title}
                    className="flex items-center gap-3 rounded-md border border-white/5 bg-white/[0.03] p-1 px-3 text-left transition hover:border-emerald-500/30 hover:bg-white/[0.06]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium text-white/80">{title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/5">
            <div className="rounded-md bg-white/[0.03] p-3 border border-white/5">
              <div className="text-xs text-neutral-500 flex flex-col gap-1">
                <span className="text-green-400 font-medium">Prosperity v1.0</span>
                <span>Built by Mohhit1230</span>
              </div>
            </div>
          </div>
        </div>
        <div
        className={` w-full h-screen z-50 bg-black/60 backdrop-blur-3xl  transition-all duration-300 ${isOpen ? "opacity-100 " : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsOpen(false)}
      > </div>
       
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default DrawerBasic;