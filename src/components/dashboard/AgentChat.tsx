"use client";

import { useEffect, useRef, useState } from "react";
import { navFont } from "@/app/fonts";
import ChatMarkdown from "./ChatMarkdown";

type ChatRole = "user" | "assistant" | "error";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type AgentStreamEvent =
  | { type: "assistant"; agent_id: string; run_id: string; message: { content: Array<{ type: string; text?: string }> } }
  | { type: "thinking"; text: string }
  | { type: "tool_call"; name: string; status: string }
  | { type: "status"; status: string; message?: string }
  | { type: "done"; agentId: string; result?: { result?: string } }
  | { type: "error"; message: string; retryable?: boolean };

function createId() {
  return crypto.randomUUID();
}

function extractAssistantDelta(event: AgentStreamEvent): string | null {
  if (event.type !== "assistant") {
    return null;
  }

  return event.message.content
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text!)
    .join("");
}

async function* readAgentStream(
  message: string,
  agentId?: string,
): AsyncGenerator<AgentStreamEvent> {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, agentId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to reach agent");
  }

  if (!response.body) {
    throw new Error("Agent stream unavailable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const line = chunk.trim();
      if (!line.startsWith("data: ")) {
        continue;
      }

      yield JSON.parse(line.slice(6)) as AgentStreamEvent;
    }
  }
}

type AgentChatProps = {
  showHeader?: boolean;
};

export default function AgentChat({ showHeader = true }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [agentId, setAgentId] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isRunning) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
    };

    const assistantId = createId();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setIsRunning(true);
    setStatus("Thinking");

    try {
      for await (const event of readAgentStream(trimmed, agentId)) {
        if (event.type === "done") {
          setAgentId(event.agentId);
          if (event.result?.result) {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantId
                  ? { ...message, content: event.result!.result! }
                  : message,
              ),
            );
          }
          setStatus(undefined);
          continue;
        }

        if (event.type === "error") {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, role: "error", content: event.message }
                : message,
            ),
          );
          setStatus(undefined);
          continue;
        }

        if (event.type === "thinking") {
          setStatus("Thinking");
          continue;
        }

        if (event.type === "tool_call") {
          setStatus(`${event.name} · ${event.status}`);
          continue;
        }

        if (event.type === "status") {
          setStatus(event.message ?? event.status);
          continue;
        }

        const delta = extractAssistantDelta(event);
        if (delta) {
          setStatus(undefined);
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: delta }
                : message,
            ),
          );
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId
            ? { ...item, role: "error", content: message }
            : item,
        ),
      );
      setStatus(undefined);
    } finally {
      setIsRunning(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit(event);
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      {showHeader && (
        <header className="border-b border-white/5 px-1 pb-4">
          <h2
            className={`${navFont.className} text-sm font-medium tracking-[0.02em] text-white/90`}
          >
            Agent
          </h2>
          <p className={`${navFont.className} mt-1 text-sm text-white/45`}>
            Ask Cursor about this project. Conversation stays in this session.
          </p>
        </header>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto py-5 pr-1"
      >
        {messages.length === 0 ? (
          <div
            className={`${navFont.className} rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40`}
          >
            Start with a question about Saga, your codebase, or what to build
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
                    : message.role === "error"
                      ? "border border-red-500/30 bg-red-500/10 text-red-200"
                      : "border border-white/8 bg-[#242424] text-white/85"
                } ${navFont.className}`}
              >
                {message.role === "assistant" && message.content ? (
                  <ChatMarkdown content={message.content} />
                ) : (
                  message.content || (isRunning ? "…" : "")
                )}
              </div>
            </div>
          ))
        )}

        {status && (
          <p
            className={`${navFont.className} px-1 text-xs tracking-[0.04em] text-white/35`}
          >
            {status}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-white/5 pt-4"
      >
        <div className="rounded-xl border border-white/10 bg-[#242424] p-3 focus-within:border-white/20">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Ask the agent…"
            disabled={isRunning}
            className={`${navFont.className} w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-60`}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className={`${navFont.className} text-xs text-white/30`}>
              Enter to send · Shift+Enter for newline
            </span>
            <button
              type="submit"
              disabled={isRunning || !input.trim()}
              className={`${navFont.className} rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#1C1C1C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {isRunning ? "Running…" : "Send"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
