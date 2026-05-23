type SuggestionLink = {
  text: string;
  url: string;
};

type AssistantSource = {
  url: string;
  title: string;
};

type ToolInvocationPart = {
  type: "tool-invocation";
  toolInvocation?: {
    toolName?: string;
    result?: Array<{
      url?: string;
      path?: string;
      metadata?: { title?: string };
    }>;
  };
};

export function parseSuggestionLinks(
  markdown: string,
  docsUrl: string,
): SuggestionLink[] {
  return markdown
    .split("\n")
    .map((line) => {
      const match = line.match(/\(([^)]*)\)\[([^\]]*)\]/);
      if (!match?.[1] || !match[2]) {
        return null;
      }

      let url = match[2];
      if (docsUrl && url.startsWith("/")) {
        const baseUrl = docsUrl.endsWith("/") ? docsUrl.slice(0, -1) : docsUrl;
        url = `${baseUrl}${url}`;
      }

      return { text: match[1], url };
    })
    .filter((link): link is SuggestionLink => link !== null);
}

export function extractAssistantSources(
  parts: ToolInvocationPart[] | undefined,
): AssistantSource[] {
  return (
    parts
      ?.filter(
        (part) =>
          part.type === "tool-invocation" &&
          part.toolInvocation?.toolName === "search",
      )
      .flatMap((part) => part.toolInvocation?.result ?? [])
      .map((source) => ({
        url: source.url ?? source.path ?? "#",
        title: source.metadata?.title ?? source.path ?? "Source",
      })) ?? []
  );
}
