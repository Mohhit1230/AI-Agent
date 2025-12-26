import { useState, useEffect, useRef } from "react";
import NewChatScreen from "./components/NewChatScreen";
import CopyButton from "./components/CopyButton";
import FeaturesPanel from "./components/FeaturesPanel";
import MarkdownRenderer from "./components/MarkdownRenderer ";
import { MoveDown } from "lucide-react";
import DrawerBasic from "./components/Drawer/Drawer";
import Preloader from "./components/Preloader";

import {
  Bot,
  FileText,
  Zap,
  Trash2,
} from "lucide-react";

import { Badge } from "./components/ui/Badge";
import { Options } from "./components/Options";


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

      setShowScrollButton(isScrollable && isNotAtBottom && history.length > 0);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [history, loading]);

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


  const deleteHistory = () => {
    setHistory([]);
    setIsNewChat(true);
    localStorage.removeItem("chatHistory");
  };

  const deleteMessage = (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
    if (updatedHistory.length === 0) {
      setIsNewChat(true);
    }
  };
  return (
    <>
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      <div className={`bg-[#0f1115] min-h-screen ${showPreloader ? 'h-screen overflow-hidden' : ''}`}>
        <div className=" fixed inset-0 bg-[radial-gradient(70%_60%_at_30%_0%,rgba(16,185,129,0.14),rgba(0,0,0,0)_60%),radial-gradient(60%_50%_at_80%_10%,rgba(147,51,234,0.12),rgba(0,0,0,0)_55%)]" />
        <nav className="sticky top-0 z-30 w-full h-18 flex  justify-between px-8  border-b border-white/5 bg-[#0d0f13]/70 backdrop-blur-3xl backdrop-opacity-90">
          <div className="h-full w-44">
            <img src="/logo2.webp" alt="" className="w-full h-full object-cover brightness-105" />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:block mt-3">
              <Badge>
                Model:{" "}
                <span className="ml-1 font-medium text-emerald-300">
                  Gemini-2.5-flash
                </span>
              </Badge>
            </div>
            <div className="block lg:hidden xl:hidden mt-3">
              <DrawerBasic />
            </div>
          </div>
        </nav>
        <div className="bg-[#0f1115] mx-auto grid max-w-8xl grid-cols-1 gap-4 px-0 md:px-4 pb-8 pt-2 lg:grid-cols-[200px_minmax(0,1fr)_300px] md:gap-6 lg:gap-8">
          <aside className="hidden lg:block relative">
            <div className="sticky top-28">
              <Options method={deleteHistory} />
            </div>
          </aside>

          <main
            className="rounded-2xl relative w-full min-h-0 flex flex-col flex-1 text-wrap overflow-hidden"
          >
            <div className="flex relative w-full min-h-0 flex-1 h-[78dvh] md:h-[84dvh] lg:h-[86dvh] flex-col">
              
              <div className="flex min-h-0 flex-1 flex-col pb-40 px-4 py-4 ">
                <div
                  ref={chatContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto scroll-thin "
                >
                  <ul className="space-y-4 mx-auto grid w-full max-w-3xl gap-4 px-4 py-6 ">
                    {isNewChat ? (
                      <NewChatScreen />
                    ) : (
                      <>
                        {history.map((m, i) => (
                          <li
                            key={i}
                            className={`flex  w-full ${m.role === "user"
                              ? "justify-end"
                              : "justify-start"
                              }`}
                          >
                            <div
                              className={`relative max-w-[100%] tracking-wider group ${m.role === "user"
                                ? " bg-[#282a2c] text-[#e7e5e5] shadow rounded-2xl px-3 pt-2 break-words whitespace-pre-wrap"
                                : "mt-6 mb-4 pt-2 rounded-2xl text-[#e7e5e5] "
                                }`}
                            >
                              {(() => {
                                const text = m.parts?.[0]?.text;

                                // Check if it's a resource_link object (PDF)
                                if (text?.type === "resource_link") {
                                  return (
                                    <div className="flex flex-col gap-3">
                                      <div className="w-full h-80 rounded-xl overflow-hidden border border-white/10 bg-white/5 relative group/pdf">
                                        <iframe
                                          src={`${text.uri}#toolbar=0&navpanes=0&scrollbar=0`}
                                          className="w-full h-full pointer-events-none"
                                          title="PDF Preview"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/pdf:opacity-100 transition-opacity">
                                          <a
                                            href={text.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-emerald-600 transition-colors"
                                          >
                                            <FileText className="h-4 w-4" /> View Full PDF
                                          </a>
                                        </div>
                                      </div>
                                      <a
                                        href={text.uri}
                                        download={text.name || "output.pdf"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-200 ml-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-blue-400 hover:text-blue-500 font-medium">
                                            📄 {text.name || "your PDF"}
                                          </span>
                                          <span className="text-[10px] text-neutral-500">(Click to download)</span>
                                        </div>
                                      </a>
                                    </div>
                                  );
                                }

                                // Check if it's an image object
                                if (text?.type === "image") {
                                  return (
                                    <div className="flex flex-col gap-2">
                                      <div
                                        className="cursor-pointer group relative overflow-hidden rounded-lg border border-white/10"
                                        onClick={() => {
                                          setPreviewImage(text.data);
                                          setIsImageModalOpen(true);
                                        }}
                                      >
                                        <img
                                          src={text.data}
                                          alt={text.name || "Screenshot"}
                                          className="max-w-full transition-transform duration-300 group-hover:scale-[1.02]"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Zap className="h-6 w-6 text-white drop-shadow-lg" />
                                        </div>
                                      </div>
                                      <a
                                        href={text.data}
                                        download={text.name || "screenshot.png"}
                                        className="text-blue-400 hover:text-blue-500 text-sm font-medium ml-1"
                                      >
                                        📥 Download Image
                                      </a>
                                    </div>
                                  );
                                }

                                // Check if it's a base64 image string (data:image/...)
                                if (typeof text === "string" && text.startsWith("data:image/")) {
                                  return (
                                    <div className="flex flex-col gap-2 mb-3">
                                      <div
                                        className="cursor-pointer group relative overflow-hidden rounded-lg border border-white/10"
                                        onClick={() => {
                                          setPreviewImage(text);
                                          setIsImageModalOpen(true);
                                        }}
                                      >
                                        <img
                                          src={text}
                                          alt="Screenshot"
                                          className="max-w-full transition-transform duration-300 group-hover:scale-[1.02]"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Zap className="h-6 w-6 text-white drop-shadow-lg" />
                                        </div>
                                      </div>
                                      <a
                                        href={text}
                                        download="screenshot.png"
                                        className="text-blue-400 hover:text-blue-500 text-sm font-medium ml-1"
                                      >
                                        📥 Download Image
                                      </a>
                                    </div>
                                  );
                                }

                                // Check if text contains both description and base64 image
                                if (typeof text === "string" && text.includes("data:image/")) {
                                  const parts = text.split(/\n\n(data:image\/[^"'\s]+)/);
                                  if (parts.length > 1) {
                                    return (
                                      <div className="flex flex-col gap-2">
                                        {m.role === "model" && <Bot className="h-4 w-4 text-green-500" />}
                                        {parts[0] && <MarkdownRenderer content={parts[0]} />}
                                        <div
                                          className="cursor-pointer group relative overflow-hidden rounded-lg border border-white/10 mt-2"
                                          onClick={() => {
                                            setPreviewImage(parts[1]);
                                            setIsImageModalOpen(true);
                                          }}
                                        >
                                          <img
                                            src={parts[1]}
                                            alt="Screenshot"
                                            className="max-w-full transition-transform duration-300 group-hover:scale-[1.02]"
                                          />
                                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Zap className="h-6 w-6 text-white drop-shadow-lg" />
                                          </div>
                                        </div>
                                        <a
                                          href={parts[1]}
                                          download="screenshot.png"
                                          className="text-blue-400 hover:text-blue-500 text-sm font-medium ml-1"
                                        >
                                          📥 Download Image
                                        </a>
                                      </div>
                                    );
                                  }
                                }

                                // Default: render as markdown
                                return (
                                  <div className="flex flex-col gap-2">
                                    {m.role === "model" && <Bot className="h-4 w-4 text-green-500" />}
                                    <MarkdownRenderer content={text} />
                                  </div>
                                );
                              })()}

                              <div className={`absolute ${m.role === "model" ? "left-1 -bottom-5" : "right-0 -bottom-9"} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                                <CopyButton
                                  text={m.parts?.[0]?.text || ""}
                                  user={m.role}
                                  pdf={m.parts?.[0]?.text?.type}
                                />
                                <button
                                  onClick={() => deleteMessage(i)}
                                  className="p-1.5 rounded-lg bg-[#1a1d21] border border-white/10 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-all duration-200"
                                  title="Delete message"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                    {loading && (
                      <div className="flex justify-start w-4">
                        <div className="bubble-loader"></div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </ul>
                </div>
              </div>
            </div>

            <div className="w-[96%] max-w-[798px] lg:w-[52%] xl:w-[52%] z-50 self-center fixed bottom-8 left-0 right-0 mx-auto mb-0 max-h-40 flex items-center gap-2 rounded-full border border-white/10 bg-[#12151b] p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendMessage()
                }
                disabled={loading}
                placeholder="Ask something..."
                autoFocus={true}
                autoComplete="true"
                autoSave="true"
                autoCorrect="true"
                autoCapitalize="true"
                className="flex-1 relative rounded-lg px-4 py-2 text-sm text-white outline-none appearance-none resize-none h-9 focus:ring-0 focus:border-transparent z-10"
              />
              {loading ? (

                <div
                  className="w-6 h-6 bg-white flex justify-center items-center scale-90 rounded-full self-center mr-2 cursor-pointer hover:bg-gray-300"
                  onClick={stopLoading}
                >
                  <span className="text-lg scale-75 text-black">■</span>

                </div>

              ) : (
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="flex items-start relative justify-center py-2 pb-3 px-4 bg-black/30 hover:bg-transparent text-white rounded-full transition-colors "
                >
                  <span className="text-xl font-extrabold text-white">
                    {">>>"}
                  </span>
                </button>
              )}
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center justify-center bg-emerald-500 text-white p-3 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-110 hover:bg-emerald-400 active:scale-95 z-[9999] cursor-pointer"
                >
                  <MoveDown className="h-6 w-6 stroke-[3px]" />
                </button>
              )}
            </div>

          </main>
          <aside className="hidden lg:block">
            <FeaturesPanel />
          </aside>


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
}

export default App;
