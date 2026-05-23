/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@cursor/sdk", "sqlite3"],
  },
};

export default nextConfig;
