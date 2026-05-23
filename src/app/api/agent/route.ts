import { CursorAgentError, streamLocalAgentRun } from "@/lib/cursor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AgentRequestBody = {
  message?: string;
  agentId?: string;
};

function encodeSse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  let body: AgentRequestBody;

  try {
    body = (await request.json()) as AgentRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const generator = streamLocalAgentRun({
          message,
          agentId: body.agentId,
        });

        let result = await generator.next();
        while (!result.done) {
          controller.enqueue(encoder.encode(encodeSse(result.value)));
          result = await generator.next();
        }

        controller.enqueue(
          encoder.encode(
            encodeSse({
              type: "done",
              agentId: result.value.agentId,
              result: result.value.result,
            }),
          ),
        );
      } catch (error) {
        const messageText =
          error instanceof CursorAgentError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Unknown agent error";

        controller.enqueue(
          encoder.encode(
            encodeSse({
              type: "error",
              message: messageText,
              retryable:
                error instanceof CursorAgentError ? error.isRetryable : false,
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
