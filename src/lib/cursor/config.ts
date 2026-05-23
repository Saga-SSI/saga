import path from "node:path";

const DEFAULT_MODEL_ID = "composer-2.5";

export function getCursorApiKey(): string {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "CURSOR_API_KEY is not set. Add it to .env.local or your deployment environment.",
    );
  }
  return apiKey;
}

/** Project root for local agent runs against this repo. */
export function getProjectRoot(): string {
  return path.resolve(process.cwd());
}

export function getDefaultModel() {
  return { id: DEFAULT_MODEL_ID } as const;
}
