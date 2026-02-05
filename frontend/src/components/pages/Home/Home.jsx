import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import DrawerBasic from "../../Drawer/Drawer";
import CopyButton from "./CopyButton";
import MarkdownRenderer from "./MarkdownRenderer ";
import NewChatScreen from "./NewChatScreen";
import {
  Trash2,
  Info,
  ExternalLink,
  Bot,
  Zap,
  FileText,
  MoveDown,
  Menu,
  CheckSquare,
  Square,
  X,
} from "lucide-react";

const Home = ({ showPreloader }) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());

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
              {
                text:
                  data?.data?.type === "image"
                    ? data.data
                    : data?.data?.text || data?.data?.[0] || data.parts,
              },
            ],
          },
        ];
        localStorage.setItem("chatHistory", JSON.stringify(updated));
        return updated;
      });
      console.log("data.data: ", data.data);
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

  const scrollToBottom = () => {
    if (chatEndRef.current && !showPreloader) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (chatEndRef.current && !showPreloader) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, loading, showPreloader]);

  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [history, loading]);

  const deleteMessage = useCallback((index) => {
    setHistory((prev) => {
      const updatedHistory = prev.filter((_, i) => i !== index);
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
      if (updatedHistory.length === 0) {
        setIsNewChat(true);
      }
      return updatedHistory;
    });
  }, []);

  const deleteHistory = useCallback(() => {
    setHistory([]);
    setIsNewChat(true);
    localStorage.removeItem("chatHistory");
  }, []);

  const toggleMessageSelection = useCallback((index) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const deleteSelectedMessages = useCallback(() => {
    setHistory((prev) => {
      const updatedHistory = prev.filter((_, i) => !selectedMessages.has(i));
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
      if (updatedHistory.length === 0) {
        setIsNewChat(true);
      }
      return updatedHistory;
    });
    setSelectedMessages(new Set());
    setSelectMode(false);
  }, [selectedMessages]);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedMessages(new Set());
  }, []);
  return (
    <>
      <div
        className={`flex  min-h-screen ${showPreloader ? "h-screen overflow-hidden" : ""
          } selection:bg-cyan-500/40 selection:text-white`}
      >
        {/* Clean background - grid pattern handled by CSS */}

        <DrawerBasic
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          deleteHistory={deleteHistory}
        />
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <nav className="fixed top-0 left-0 lg:left-auto right-0 px-6 z-30 w-full lg:w-[calc(100%-260px)] h-16 flex items-center justify-between border-b border-white/5 bg-[#0f1115]/80 backdrop-blur-md">
            <div className="w-full flex items-center justify-between gap-4">
              {/* Left: Mobile Menu Trigger */}
              <div className="flex-1 lg:hidden">
                <button
                  onClick={() => setIsOpen(true)}
                  className="p-2 px-3.5 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 text-emerald-400 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Menu className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-200">
                    Menu
                  </span>
                </button>
              </div>

              {/* Center: Model Status */}
              <div className="flex items-center justify-center gap-2">
                <span className="bg-emerald-500/5 text-emerald-400 border-emerald-500/20 px-4 py-1.5 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap inline-flex items-center rounded-full border text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  OpenAI o3-mini
                </span>
                <span className="hidden sm:inline-flex bg-cyan-500/5 text-cyan-400 border-cyan-500/20 px-3 py-1.5 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap items-center rounded-full border">
                  + Gemini 2.5 Flash
                </span>
              </div>

              {/* Right: Select Mode Controls */}
              <div className="flex items-center gap-2">
                {selectMode ? (
                  <>
                    <button
                      onClick={deleteSelectedMessages}
                      disabled={selectedMessages.size === 0}
                      className="p-2 px-3 flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
                        Delete ({selectedMessages.size})
                      </span>
                    </button>
                    <button
                      onClick={exitSelectMode}
                      className="p-2 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  !isNewChat && (
                    <button
                      onClick={() => setSelectMode(true)}
                      className="p-2 px-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
                        Select
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </nav>

          <main className="flex-1 flex flex-col relative w-full pt-16 overflow-hidden">
            <div
              className="flex-1 overflow-y-auto scroll-thin"
              ref={chatContainerRef}
            >
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
                        className={`flex w-full items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"
                          }`}
                      >
                        {/* Selection Checkbox - Left side for model, right handled by flex-row-reverse */}
                        {selectMode && m.role !== "user" && (
                          <button
                            onClick={() => toggleMessageSelection(i)}
                            className="flex-shrink-0 mt-1 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            {selectedMessages.has(i) ? (
                              <CheckSquare className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <Square className="h-5 w-5 text-neutral-500" />
                            )}
                          </button>
                        )}
                        <div
                          className={`relative max-w-[90%] md:max-w-[85%] group ${m.role === "user"
                            ? "bg-[#282a2c] text-[#e7e5e5] shadow-lg rounded-2xl px-4 py-2 break-words whitespace-pre-wrap"
                            : "text-[#e1e1e1] w-full"
                            } ${selectMode && selectedMessages.has(i)
                              ? "ring-1 ring-red-500/40 rounded-xl"
                              : ""
                            }`}
                          onClick={
                            selectMode
                              ? () => toggleMessageSelection(i)
                              : undefined
                          }
                          style={selectMode ? { cursor: "pointer" } : {}}
                        >
                          {(() => {
                            const text = m.parts?.[0]?.text;
                            if (text?.type === "resource_link") {
                              return (
                                <div className="flex flex-col gap-4 w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-2 duration-500 mb-3">
                                  {/* Premium Structured Document Card */}
                                  <div className="relative group/pdf overflow-hidden rounded-xl bg-[#1a1c21] border border-white/5 shadow-2xl transition-all duration-500 hover:border-cyan-500/20 hover:shadow-cyan-500/5">
                                    {/* Card Header: Metadata & Stats */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover/pdf:scale-110 transition-transform duration-500">
                                          <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 truncate max-w-[140px]">
                                            {text.name || "Generated Doc"}
                                          </span>
                                          <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wide">
                                            Portable Document Format
                                          </span>
                                        </div>
                                      </div>
                                      <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-emerald-500 uppercase">
                                        v1.0
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
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all"
                                      >
                                        <Zap className="h-3 w-3 fill-current" />{" "}
                                        Download
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            if (
                              text?.type === "image" ||
                              (typeof text === "string" &&
                                text.startsWith("data:image/"))
                            ) {
                              const imgData =
                                typeof text === "string" ? text : text.data;
                              return (
                                <div className="flex flex-col gap-2 mb-3">
                                  <div
                                    className="cursor-pointer group relative overflow-hidden rounded-xl bg-[#222] w-fit"
                                    onClick={() => {
                                      setPreviewImage(imgData);
                                      setIsImageModalOpen(true);
                                    }}
                                  >
                                    <img
                                      src={imgData}
                                      alt="Screenshot"
                                      className="max-w-full max-h-[400px] transition-transform duration-300 group-hover:scale-[1.01]"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <a
                                    href={imgData}
                                    download="screenshot.png"
                                    className="text-blue-400 hover:text-blue-500 text-xs font-bold ml-1 uppercase tracking-widest"
                                  >
                                    📥 Download
                                  </a>
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
                                <MarkdownRenderer
                                  content={
                                    typeof text === "string"
                                      ? text
                                      : JSON.stringify(text)
                                  }
                                />
                              </div>
                            );
                          })()}
                          <div
                            className={`absolute ${m.role === "model"
                              ? "left-0 -bottom-8"
                              : "right-0 -bottom-10"
                              } flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pr-2 pb-2`}
                          >
                            <CopyButton
                              text={
                                typeof m.parts?.[0]?.text === "string"
                                  ? m.parts?.[0]?.text
                                  : ""
                              }
                              user={m.role}
                            />
                            {!selectMode && (
                              <button
                                onClick={() => deleteMessage(i)}
                                className="p-1.5 rounded-lg bg-[#1a1d21] border border-white/10 text-neutral-400 hover:text-red-400 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Selection Checkbox - Right side for user messages */}
                        {selectMode && m.role === "user" && (
                          <button
                            onClick={() => toggleMessageSelection(i)}
                            className="flex-shrink-0 mt-1 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            {selectedMessages.has(i) ? (
                              <CheckSquare className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <Square className="h-5 w-5 text-neutral-500" />
                            )}
                          </button>
                        )}
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
            <div className="fixed bottom-0 left-0 lg:left-auto right-0 lg:w-[calc(100%-260px)] z-20 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pt-12 pb-1 px-4 md:px-6 pointer-events-none">
              <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                <div className="relative group">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendMessage()
                    }
                    disabled={loading}
                    placeholder="Ask anything ..."
                    spellCheck={false}
                    autoComplete="off"
                    className="w-full bg-[#1e2025] text-white rounded-2xl px-4 py-4 pr-14 text-sm outline-none resize-none h-14 max-h-40 focus:border-emerald-500/30 transition-all placeholder:tracking-wider placeholder:text-white/20"
                  />
                  <div className="absolute right-3.5 bottom-5.5">
                    {loading ? (
                      <button
                        onClick={stopLoading}
                        className="h-6 w-6 flex items-center justify-center rounded-lg bg-white text-black hover:bg-gray-200 transition-colors"
                      >
                        <div className="h-2 w-2 bg-black rounded-[2px]" />
                      </button>
                    ) : (
                      <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-10 disabled:grayscale transition-all"
                      >
                        <Zap className="h-4 w-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scroll to Bottom Button */}

                <button
                  onClick={scrollToBottom}
                  className="absolute -top-0 right-16 -translate-x-1/2 flex items-center justify-center border bg-black/30 text-white p-2 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:bg-black/50 active:scale-95 z-[9999] cursor-pointer"
                >
                  <MoveDown className="h-5 w-5 " />
                </button>

                <p className="text-[10px] text-center text-neutral-500 mt-3 font-medium tracking-tight">
                  Prosmic (OpenAI + Gemini) may display inaccurate info,
                  so double-check important responses.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
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
};

export default Home;
