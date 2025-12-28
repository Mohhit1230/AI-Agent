import { useState, useEffect, useRef } from "react";
import NewChatScreen from "./components/NewChatScreen";
import CopyButton from "./components/CopyButton";
import MarkdownRenderer from "./components/MarkdownRenderer ";
import DrawerBasic from "./components/Drawer/Drawer";
import Preloader from "./components/Preloader";
import { Routes, Route, Link } from "react-router-dom";

import {
  Trash2,
  Info,
  ExternalLink,
  Bot,
  Zap,
  FileText,
  MoveDown,
  Menu
} from "lucide-react";

import { Badge } from "./components/ui/Badge";
import About from "./components/About";


function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setIsNewChat(false);
    const newHistory = [...history, { role: "user", parts: [{ text: input }] }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
        signal,
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error("Server returned non-200 response:", resp.status, text);
        throw new Error("API request failed");
      }
      const data = await resp.json();

      setHistory((h) => {
        const updated = [
          ...h,
          {
            role: "model",
            parts: [
              { text: data?.data?.text || data?.data?.[0] || data.parts },
            ],
          },
        ];
        localStorage.setItem("chatHistory", JSON.stringify(updated));
        return updated;
      });
      console.log("data.data.text: ", data.data.text);
      console.log("data.data.content: ", data.data[0]);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    abortControllerRef.current = null;
  };

  const stopLoading = () => {
    console.log(
      "Stop button clicked, abortControllerRef:",
      abortControllerRef.current
    );
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      console.log("Stopped the AI from overthinking!");
    }
  };
  useEffect(() => {
    const getItem = JSON.parse(localStorage.getItem("chatHistory"));
    if (getItem) {
      setHistory(getItem);
      setIsNewChat(getItem.length === 0);
    }
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollHeight, clientHeight, scrollTop } = container;
      const isScrollable = scrollHeight > clientHeight;
      const isNotAtBottom = scrollHeight - clientHeight - scrollTop > 50;
      console.log("isScrollable: ", isScrollable);
      console.log("isNotAtBottom: ", isNotAtBottom);
      console.log("history.length: ", history.length);
      console.log("showScrollButton: ", isScrollable && isNotAtBottom && history.length > 0);
      setShowScrollButton(isScrollable && isNotAtBottom && history.length > 0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [history]);

  const scrollToBottom = () => {

    if (chatEndRef.current && !showPreloader) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setShowScrollButton(false);
  };

  useEffect(() => {
    if (chatEndRef.current && !showPreloader) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setShowScrollButton(false);
  }, [history, loading, showPreloader]);

  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [history, loading]);




  const deleteMessage = (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
    if (updatedHistory.length === 0) {
      setIsNewChat(true);
    }
  };
  const deleteHistory = () => {
    setHistory([]);
    setIsNewChat(true);
    localStorage.removeItem("chatHistory");
  };
  return (
    <>
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      <Routes>
        <Route path="/" element={
          <div className={`flex bg-[#0f1115] min-h-screen ${showPreloader ? 'h-screen overflow-hidden' : ''}`}>
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-[-20%] left-[-4%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-20%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <DrawerBasic
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              deleteHistory={deleteHistory}
            />
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative min-w-0">

              <nav className="fixed top-0 left-0 lg:left-auto right-0 px-6 z-30 w-full lg:w-[calc(100%-260px)] h-16 flex items-center justify-between border-b border-white/5 bg-[#0f1115]/70 backdrop-blur-xl">
                <div className="w-full flex items-center justify-between gap-4">
                  {/* Left: Mobile Menu Trigger */}
                  <div className="flex-1 lg:hidden">
                    <button
                      onClick={() => setIsOpen(true)}
                      className="p-2 px-3.5 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 text-emerald-400 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <Menu className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-200">Menu</span>
                    </button>
                  </div>

                  {/* Center: Model Status */}
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-400 border-emerald-500/20 px-4 py-1.5 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                      Gemini-2.5-flash
                    </Badge>
                  </div>


                </div>


              </nav>

              <main className="flex-1 flex flex-col relative w-full pt-16 overflow-hidden">
                <div className="flex-1 overflow-y-auto scroll-thin" ref={chatContainerRef}>
                  <div className="max-w-3xl mx-auto w-full px-4 py-8 pb-40">
                    {isNewChat ? (
                      <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <NewChatScreen />
                      </div>
                    ) : (
                      <ul className="space-y-8">
                        {history.map((m, i) => (
                          <li
                            key={i}
                            className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`relative max-w-[90%] md:max-w-[85%] group ${m.role === "user"
                                ? "bg-[#282a2c] text-[#e7e5e5] shadow-lg rounded-2xl px-4 py-2 break-words whitespace-pre-wrap"
                                : "text-[#e1e1e1] w-full"
                                }`}
                            >
                              {(() => {
                                const text = m.parts?.[0]?.text;
                                if (text?.type === "resource_link") {
                                  return (
                                    <div className="flex flex-col gap-4 w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                                      {/* Premium Structured Document Card */}
                                      <div className="relative group/pdf overflow-hidden rounded-[2rem] bg-[#1a1c21] border border-white/5 shadow-2xl transition-all duration-500 hover:border-emerald-500/20 hover:shadow-emerald-500/5">

                                        {/* Card Header: Metadata & Stats */}
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover/pdf:scale-110 transition-transform duration-500">
                                              <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-[11px] font-black uppercase tracking-widest text-white/90 truncate max-w-[140px]">
                                                {text.name || "Generated Doc"}
                                              </span>
                                              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tighter">Portable Document Format</span>
                                            </div>
                                          </div>
                                          <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-emerald-500 uppercase">
                                            v1.0
                                          </div>
                                        </div>

                                        {/* Card Body: The Preview Frame */}
                                        <div className="relative h-[280px] w-full bg-[#0d0f13] overflow-hidden no-scrollbar">
                                          <iframe
                                            src={`${text.uri}#toolbar=0&navpanes=0&scrollbar=0`}
                                            className="w-full h-full pointer-events-none opacity-40 group-hover/pdf:opacity-100 transition-opacity duration-700 filter grayscale group-hover/pdf:grayscale-0 no-scrollbar"
                                            title="Document Intelligence Preview"
                                          />

                                          {/* Hover Overlay Actions */}
                                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover/pdf:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4">
                                            <div className="flex gap-2">
                                              <a
                                                href={`${text.uri}#toolbar=0&navpanes=0`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all"
                                                title="Open in new tab"
                                              >
                                                <ExternalLink className="h-5 w-5" />
                                              </a>
                                              <a
                                                href={text.uri}
                                                download={text.name || "output.pdf"}
                                                className="p-3 bg-white text-black rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                                                title="Download document"
                                              >
                                                <Zap className="h-5 w-5 fill-current" />
                                              </a>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 animate-pulse">
                                              Inspect Document
                                            </span>
                                          </div>
                                        </div>

                                        {/* Card Footer: Fast Actions */}
                                        <div className="grid grid-cols-2 p-3 gap-3 bg-white/[0.01]">
                                          <a
                                            href={`${text.uri}#toolbar=0&navpanes=0`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                                          >
                                            <Info className="h-3 w-3" /> Preview
                                          </a>
                                          <a
                                            href={text.uri}
                                            download={text.name || "output.pdf"}
                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                          >
                                            <Zap className="h-3 w-3 fill-current" /> Download
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                if (text?.type === "image" || (typeof text === "string" && text.startsWith("data:image/"))) {
                                  const imgData = typeof text === "string" ? text : text.data;
                                  return (
                                    <div className="flex flex-col gap-2">
                                      <div className="cursor-pointer group relative overflow-hidden rounded-xl border border-white/10 w-fit"
                                        onClick={() => { setPreviewImage(imgData); setIsImageModalOpen(true); }}>
                                        <img src={imgData} alt="Screenshot" className="max-w-full max-h-[400px] transition-transform duration-300 group-hover:scale-[1.01]" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                      <a href={imgData} download="screenshot.png" className="text-blue-400 hover:text-blue-500 text-xs font-bold ml-1 uppercase tracking-widest">📥 Download</a>
                                    </div>
                                  );
                                }
                                return (
                                  <div className="flex flex-col gap-2">
                                    {m.role === "model" && (
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                          <Bot className="h-3.5 w-3.5 text-emerald-400" />
                                        </div>

                                      </div>
                                    )}
                                    <MarkdownRenderer content={typeof text === "string" ? text : JSON.stringify(text)} />
                                  </div>
                                );
                              })()}
                              <div className={`absolute ${m.role === "model" ? "left-0 -bottom-8" : "right-0 -bottom-10"} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pr-2 pb-2`}>
                                <CopyButton text={typeof m.parts?.[0]?.text === 'string' ? m.parts?.[0]?.text : ""} user={m.role} />
                                <button onClick={() => deleteMessage(i)} className="p-1.5 rounded-lg bg-[#1a1d21] border border-white/10 text-neutral-400 hover:text-red-400 transition-all cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </div>
                          </li>
                        ))}
                        <div ref={chatEndRef} />
                      </ul>
                    )}
                    {loading && (
                      <div className="flex items-center gap-3 mt-4">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 animate-pulse">
                          <Bot className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <div className="bubble-loader !m-0"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Fixed Bottom Overlay (ChatGPT Style) */}
                <div className="fixed bottom-0 left-0 lg:left-auto right-0 lg:w-[calc(100%-260px)] z-20 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/90 to-transparent pt-12 pb-8 px-4 md:px-6 pointer-events-none">
                  <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                    <div className="relative group">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        disabled={loading}
                        placeholder="Ask anything ..."
                        className="w-full bg-[#1e2025] text-white rounded-2xl border border-white/10 px-4 py-4 pr-14 text-sm outline-none resize-none h-14 max-h-40 focus:border-emerald-500/30 transition-all shadow-2xl placeholder:tracking-wider"
                      />
                      <div className="absolute right-3.5 bottom-5.5">
                        {loading ? (
                          <button onClick={stopLoading} className="h-6 w-6 flex items-center justify-center rounded-lg bg-white text-black hover:bg-gray-200 transition-colors">
                            <div className="h-2 w-2 bg-black rounded-[2px]" />
                          </button>
                        ) : (
                          <button onClick={sendMessage} disabled={!input.trim()} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-10 disabled:grayscale transition-all">
                            <Zap className="h-4 w-4 fill-current" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scroll to Bottom Button */}

                    {showScrollButton ? (
                      <button
                        onClick={scrollToBottom}
                        className="absolute -top-0 right-16 -translate-x-1/2 flex items-center justify-center border bg-black/30 text-white p-2 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:bg-emerald-400 active:scale-95 z-[9999] cursor-pointer"
                      >
                        <MoveDown className="h-5 w-5 " />
                      </button>
                    ):(<button
                        onClick={scrollToBottom}
                        className="absolute -top-0 right-16 -translate-x-1/2 flex items-center justify-center border bg-red-400/30 text-white p-2 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:bg-emerald-400 active:scale-95 z-[9999] cursor-pointer"
                      >
                        <MoveDown className="h-5 w-5 " />
                      </button>)}



                    <p className="text-[10px] text-center text-neutral-500 mt-3 font-medium tracking-tight">
                      Prosperity Agent may display inaccurate info, including about people, so double-check its responses.
                    </p>
                  </div>
                </div>
              </main>
            </div>
          </div>
        } />
        <Route path="/about" element={<About />} />
      </Routes>

      {/* Image Modal Overlay */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
              onClick={() => setIsImageModalOpen(false)}
            >
              <Zap className="h-8 w-8 rotate-45" />
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10 object-contain animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 flex gap-4">
              <a
                href={previewImage}
                download="screenshot.png"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-emerald-500/20"
                onClick={(e) => e.stopPropagation()}
              >
                Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
