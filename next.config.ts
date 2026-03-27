import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/aida-public/**",
      },
      {
        protocol: "https",
        hostname: "images.ft.com",
        pathname: "/v3/image/raw/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5156",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "7095",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ikinci.musahesenli.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default nextConfig;
