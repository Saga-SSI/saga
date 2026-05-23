import { CursorAgentError, verifyCursorAuth } from "@/lib/cursor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await verifyCursorAuth();
    return Response.json({ ok: true, user });
  } catch (error) {
    const message =
      error instanceof CursorAgentError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to verify Cursor API key";

    return Response.json(
      {
        ok: false,
        error: message,
        retryable: error instanceof CursorAgentError ? error.isRetryable : false,
      },
      { status: error instanceof CursorAgentError ? 401 : 500 },
    );
  }
}
