export {
  Agent,
  Cursor,
  CursorAgentError,
  createLocalAgent,
  extractAssistantText,
  listAvailableModels,
  promptLocal,
  resumeAgent,
  streamLocalAgentRun,
  verifyCursorAuth,
} from "./agent-service";

export type { RunResult, SDKMessage, StreamAgentOptions, AgentRunComplete } from "./agent-service";
export { getCursorApiKey, getDefaultModel, getProjectRoot } from "./config";
