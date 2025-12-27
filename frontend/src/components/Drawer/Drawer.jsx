import React, { useEffect } from "react";
import {
  Info,
  ExternalLink,
  X,
  SquarePen
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

const DrawerBasic = ({ isOpen, setIsOpen, deleteHistory }) => {
  // Handle escape key to close drawer
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setIsOpen]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop for mobile - only shows when isOpen is true and on small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden transition-all"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 
          Universal Sidebar/Drawer:
          - lg screens: persistent, sticky, w-[260px]
          - small screens: fixed, drawer style, z-[101] 
      */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#0d0f13] border-r border-white/5 z-[101] lg:z-40 
        transform transition-all 
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full p-4 gap-4 relative">
          

          <div className="flex items-center gap-2 px-2 py-3 mb-2">
            <div className="relative h-10 w-full flex items-center gap-3">
              <div className="h-10 w-full relative px-6">
                <div className="absolute inset-0 bg-emerald-500/6 blur-md" />
                <img src="/logo2.webp" alt="Logo" className="w-full h-full object-cover relative z-10 brightness-110" />
              </div>
              
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            <Button
        variant="secondary"
        className="w-full rounded-2xl flex justify-start group"
        onClick={() => {
          deleteHistory();
          setIsOpen(false);
        }}
      >
        <span className="flex gap-2">
          <SquarePen className='w-5 h-5 text-neutral-300 group-hover:text-emerald-400 transition-colors' />
          New Chat
        </span>
      </Button>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-1">
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Info className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">About Agent</span>
            </Link>
            <a
              href="https://github.com/Mohhit1230"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <ExternalLink className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">Repository</span>
            </a>
          </div>
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}} />
    </>
  );
};

export default DrawerBasic;