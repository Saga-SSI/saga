import {
  Agent,
  Cursor,
  CursorAgentError,
  type SDKMessage,
  type RunResult,
} from "@cursor/sdk";

import { getCursorApiKey, getDefaultModel, getProjectRoot } from "./config";

export { Agent, Cursor, CursorAgentError };
export type { SDKMessage, RunResult };

export type StreamAgentOptions = {
  message: string;
  agentId?: string;
};

export async function verifyCursorAuth() {
  return Cursor.me({ apiKey: getCursorApiKey() });
}

export async function listAvailableModels() {
  return Cursor.models.list({ apiKey: getCursorApiKey() });
}

export async function createLocalAgent(agentId?: string) {
  return Agent.create({
    apiKey: getCursorApiKey(),
    model: getDefaultModel(),
    local: { cwd: getProjectRoot() },
    ...(agentId ? { agentId } : {}),
  });
}

export async function resumeAgent(agentId: string) {
  return Agent.resume(agentId, {
    apiKey: getCursorApiKey(),
    model: getDefaultModel(),
    local: { cwd: getProjectRoot() },
  });
}

/** One-shot local prompt; disposes the agent automatically. */
export async function promptLocal(message: string): Promise<RunResult> {
  return Agent.prompt(message, {
    apiKey: getCursorApiKey(),
    model: getDefaultModel(),
    local: { cwd: getProjectRoot() },
  });
}

export type AgentRunComplete = {
  result: RunResult;
  agentId: string;
};

export async function* streamLocalAgentRun(
  options: StreamAgentOptions,
): AsyncGenerator<SDKMessage, AgentRunComplete> {
  const agent = options.agentId
    ? await resumeAgent(options.agentId)
    : await createLocalAgent();

  try {
    const run = await agent.send(options.message);

    for await (const event of run.stream()) {
      yield event;
    }

    const result = await run.wait();
    if (result.status === "error") {
      throw new Error(result.result ?? "Agent run failed");
    }

    return { result, agentId: agent.agentId };
  } finally {
    await agent[Symbol.asyncDispose]();
  }
}

export function extractAssistantText(event: SDKMessage): string | null {
  if (event.type !== "assistant") {
    return null;
  }

  return event.message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}
