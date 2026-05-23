/** @type {import('next').NextConfig} */
function getMintlifySlug() {
  const domain = process.env.MINTLIFY_DOMAIN?.trim();
  if (domain) {
    return domain.replace(/\.mintlify\.app$/i, "");
  }

  return "saga-1065dff9";
}

function getMintlifyRewriteTargets() {
  const localDev = process.env.MINTLIFY_LOCAL_DEV_URL?.trim();
  if (process.env.NODE_ENV === "development" && localDev) {
    const base = localDev.replace(/\/$/, "");
    return { docsBase: base, assetsBase: base };
  }

  const explicit = process.env.MINTLIFY_REWRITE_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/$/, "");
    return {
      docsBase: normalized,
      assetsBase: normalized.replace(/\/docs$/, ""),
    };
  }

  const slug = getMintlifySlug();

  if (process.env.MINTLIFY_DOCS_SUBPATH === "true") {
    return {
      docsBase: `https://${slug}.mintlify.dev/docs`,
      assetsBase: `https://${slug}.mintlify.dev`,
    };
  }

  const appOrigin = `https://${slug}.mintlify.app`;
  return {
    docsBase: appOrigin,
    assetsBase: appOrigin,
  };
}

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@cursor/sdk", "sqlite3"],
  },
  async rewrites() {
    const { docsBase, assetsBase } = getMintlifyRewriteTargets();

    return [
      {
        source: "/docs",
        destination: `${docsBase}/`,
      },
      {
        source: "/docs/:match*",
        destination: `${docsBase}/:match*`,
      },
      {
        source: "/mintlify-assets/:match*",
        destination: `${assetsBase}/mintlify-assets/:match*`,
      },
      {
        source: "/_mintlify/:match*",
        destination: `${assetsBase}/_mintlify/:match*`,
      },
    ];
  },
};

export default nextConfig;
