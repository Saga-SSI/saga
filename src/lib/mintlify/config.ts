const DEFAULT_DOCS_URL = "http://localhost:3000/docs";

function getDefaultDocsUrl() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : DEFAULT_DOCS_URL.replace(/\/docs$/, ""));

  return `${appUrl.replace(/\/$/, "")}/docs`;
}

export type MintlifyPublicConfig = {
  domain: string;
  docsUrl: string;
  configured: boolean;
};

export function getMintlifyServerConfig() {
  const domain = process.env.MINTLIFY_DOMAIN?.trim() ?? "";
  const token =
    process.env.MINTLIFY_ASSISTANT_TOKEN?.trim() ??
    process.env.NEXT_PUBLIC_MINTLIFY_TOKEN?.trim() ??
    "";
  const docsUrl =
    process.env.MINTLIFY_DOCS_URL?.trim() ??
    process.env.NEXT_PUBLIC_MINTLIFY_DOCS_URL?.trim() ??
    getDefaultDocsUrl();

  return { domain, token, docsUrl };
}

export function getMintlifyPublicConfig(): MintlifyPublicConfig {
  const { domain, token, docsUrl } = getMintlifyServerConfig();

  return {
    domain,
    docsUrl,
    configured: Boolean(domain && token),
  };
}

export function getMintlifyAssistantApiUrl(domain: string) {
  return `https://api-dsc.mintlify.com/v1/assistant/${domain}/message`;
}
