/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow BigQuery & Anthropic SDK in server-side API routes (Next.js 14)
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/bigquery', '@anthropic-ai/sdk'],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },

  images: {
    domains: ['i.ytimg.com', 'yt3.ggpht.com'],
  },
};

module.exports = nextConfig;
