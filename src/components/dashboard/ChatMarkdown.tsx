"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMarkdownProps = {
  content: string;
};

export default function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="chat-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="chat-markdown-link"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="chat-markdown-pre">{children}</pre>
          ),
          code: ({ className, children }) => {
            const isBlock = Boolean(className);

            if (isBlock) {
              return <code className={className}>{children}</code>;
            }

            return <code className="chat-markdown-inline-code">{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
