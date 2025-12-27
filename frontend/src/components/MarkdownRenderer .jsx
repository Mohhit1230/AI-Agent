import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import CopyButton from "./CopyButton";

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="max-w-3xl text-white font-normal text-sm text-wrap overflow-x-hidden">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-3xl font-extrabold mt-6 mb-2 " {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl font-bold mt-5 mb-2" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className="text-xl font-semibold mt-3 mb-2" {...props} />
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-gray-200" {...props}>
              {children}
            </em>
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-inside  ml-5 my-2 text-sm tracking-wider"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside ml-5 my-2 text-xs tracking-wider "
              {...props}
            />
          ),
          li: ({ children, ...props }) => (
            <li
              className="mb-1 leading-relaxed text-xs tracking-wider "
              {...props}
            >
              {children}
            </li>
          ),
          code: ({ inline, className, children, ...props }) => {

            return inline ? (
              <code className=" text-zinc-300 px-1 pb-1 rounded" {...props}>
                {children}
              </code>
            ) : (
              <code
                className={`px-2 text-[13px] bg-white/10 tracking-wide pb-1 rounded-md ${className}`}
                {...props}
              >
                {children}

              </code>

            );
          },
          pre: ({ children }) => {

            const className = children?.props?.className || "";
            const language = className.replace("hljs language-", "") || "text";

            return (
              <div className="mb-5 mt-5 bg-[#0d1117] rounded-lg overflow-hidden border border-zinc-700 self-center mx-auto">
                {/* 🏷️ Language Label */}
                <div className="relative px-4 py-1 text-xs font-mono bg-white/5 text-zinc-400 border-b border-zinc-700 tracking-wider">
                  <span>{language}</span>
                  <CopyButton text={`\`\`\`${content.split("```")[1]}\`\`\``} user="" model="assistant" />
                </div>

                {/* 💻 Actual Code Block */}
                <pre className="overflow-x-hidden ">
                  {children}
                </pre>
              </div>
            );
          },

          p: ({ node, ...props }) => {
            const isInsideList = node?.parent?.tagName === "li";
            return (
              <p
                className={
                  isInsideList
                    ? ""
                    : "mb-3  tracking-wider font-extralight leading-relaxed text-gray-100 text-xs"
                }
                {...props}
              />
            );
          },
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline hover:underline-offset-4 transition-colors duration-200"
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={src}
                alt={alt}
                className="w-full h-auto object-contain max-h-[500px]"
                {...props}
              />
              {alt && alt !== 'screenshot' && (
                <div className="px-4 py-2 bg-white/5 text-[10px] text-zinc-400 italic border-t border-white/5">
                  {alt}
                </div>
              )}
            </div>
          ),

        }}
      >
        {typeof content === 'string' ? content : JSON.stringify(content)}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
