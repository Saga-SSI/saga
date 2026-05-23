"use client";

import { useChat, type Message } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { navFont } from "@/app/fonts";
import {
  extractAssistantSources,
  parseSuggestionLinks,
} from "@/lib/mintlify/utils";
import ChatMarkdown from "./ChatMarkdown";

type DocsAssistantChatProps = {
  docsUrl: string;
  configured: boolean;
  showHeader?: boolean;
};

function AssistantMessage({
  message,
  docsUrl,
}: {
  message: Message;
  docsUrl: string;
}) {
  const sources = extractAssistantSources(
    message.parts as Parameters<typeof extractAssistantSources>[0],
  );

  return (
    <>
      <ChatMarkdown content={message.content} />
      {sources.length > 0 && (
        <div className="mt-3 border-t border-white/8 pt-3">
          <p
            className={`${navFont.className} mb-2 text-xs uppercase tracking-[0.08em] text-white/35`}
          >
            Sources
          </p>
          <ul className="space-y-1">
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${navFont.className} text-xs text-white/60 underline decoration-white/20 underline-offset-2 hover:text-white/90`}
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {message.content.includes("```suggestions") && (
        <SuggestionLinks content={message.content} docsUrl={docsUrl} />
      )}
    </>
  );
}

function SuggestionLinks({
  content,
  docsUrl,
}: {
  content: string;
  docsUrl: string;
}) {
  const match = content.match(/```suggestions\n([\s\S]*?)```/);
  if (!match?.[1]) {
    return null;
  }

  const links = parseSuggestionLinks(match[1], docsUrl);
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noreferrer noopener"
          className={`${navFont.className} rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:border-white/20 hover:text-white`}
        >
          {link.text}
        </a>
      ))}
    </div>
  );
}

export default function DocsAssistantChat({
  docsUrl,
  configured,
  showHeader = true,
}: DocsAssistantChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/mintlify/assistant",
      body: {
        fp: "anonymous",
        retrievalPageSize: 5,
        currentPath: "/dashboard",
      },
      streamProtocol: "data",
      sendExtraMessageFields: true,
    });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading, error]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!configured || isLoading || !input.trim()) {
        return;
      }
      handleSubmit(event);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      return;
    }
    handleSubmit(event);
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      {showHeader && (
        <header className="border-b border-white/5 px-1 pb-4">
          <h2
            className={`${navFont.className} text-sm font-medium tracking-[0.02em] text-white/90`}
          >
            Docs Assistant
          </h2>
          <p className={`${navFont.className} mt-1 text-sm text-white/45`}>
            Ask about Saga with answers cited from Mintlify documentation.
          </p>
        </header>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto py-5 pr-1"
      >
        {!configured ? (
          <div
            className={`${navFont.className} rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm leading-relaxed text-amber-100/90`}
          >
            Add <code className="text-amber-50">MINTLIFY_DOMAIN</code> and{" "}
            <code className="text-amber-50">MINTLIFY_ASSISTANT_TOKEN</code> to{" "}
            <code className="text-amber-50">.env.local</code>, then restart the
            dev server. Create keys at{" "}
            <a
              href="https://dashboard.mintlify.com/settings/organization/api-keys"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2"
            >
              dashboard.mintlify.com
            </a>
            .
          </div>
        ) : messages.length === 0 ? (
          <div
            className={`${navFont.className} rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40`}
          >
            Ask how Saga works, how to set up integrations, or what to build
            next.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-white/10 text-white"
                    : "border border-white/8 bg-[#242424] text-white/85"
                } ${navFont.className}`}
              >
                {message.role === "assistant" ? (
                  <AssistantMessage message={message} docsUrl={docsUrl} />
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <p
            className={`${navFont.className} px-1 text-xs tracking-[0.04em] text-white/35`}
          >
            Searching docs…
          </p>
        )}

        {error && (
          <p
            className={`${navFont.className} rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200`}
          >
            {error.message}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-white/5 pt-4">
        <div className="rounded-xl border border-white/10 bg-[#242424] p-3 focus-within:border-white/20">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder={
              configured
                ? "Ask about Saga docs…"
                : "Configure Mintlify to enable the assistant"
            }
            disabled={!configured || isLoading}
            className={`${navFont.className} w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-60`}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={`${navFont.className} text-xs text-white/30 underline decoration-white/10 underline-offset-2 hover:text-white/55`}
            >
              Open full docs
            </a>
            <button
              type="submit"
              disabled={!configured || isLoading || !input.trim()}
              className={`${navFont.className} rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#1C1C1C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {isLoading ? "Running…" : "Send"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
