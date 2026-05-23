import {
  getMintlifyAssistantApiUrl,
  getMintlifyPublicConfig,
  getMintlifyServerConfig,
} from "@/lib/mintlify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { domain, token } = getMintlifyServerConfig();

  if (!domain || !token) {
    return Response.json(
      {
        error:
          "Mintlify is not configured. Set MINTLIFY_DOMAIN and MINTLIFY_ASSISTANT_TOKEN in .env.local.",
      },
      { status: 503 },
    );
  }

  const body = await request.text();

  const response = await fetch(getMintlifyAssistantApiUrl(domain), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(errorText, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function GET() {
  return Response.json(getMintlifyPublicConfig());
}
