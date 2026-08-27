/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  // Next.js sends `Cache-Control: s-maxage=31536000` on prerendered pages, and
  // a CDN in front of us honours it. The HTML names content-hashed chunks, so
  // an edge copy kept for a year points at files that no longer exist after a
  // deploy: returning visitors run last week's client against this week's API.
  // That is how a stale bundle came to call deep.split("```")[1] on a query the
  // fine-tuned model returns without a fence, and crash.
  //
  // Hashed assets under /_next/static are safe to keep forever; the document
  // that names them is not.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer, dev }) => {
    config.output.webassemblyModuleFilename =
      isServer && !dev
        ? "../static/wasm/[modulehash].wasm"
        : "static/wasm/[modulehash].wasm";

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    config.module.rules.push({
      test: /.*\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[name].[contenthash][ext]",
      },
    });

    return config;
  },
};

export default nextConfig;