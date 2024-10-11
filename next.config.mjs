/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // This will be overridden by custom logic below
          },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*", // The destination should point to your actual API
      },
    ];
  },
  async middleware(req, ev) {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://casecobra-vert.vercel.app', 
      'https://casecobraback.kinde.com'
    ];

    if (allowedOrigins.includes(origin)) {
      req.headers.set('Access-Control-Allow-Origin', origin);
    }
  }

};

export default nextConfig;
