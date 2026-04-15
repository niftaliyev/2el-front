import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
        hostname: "84.247.184.186:5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5156",
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
      {
        protocol: "https",
        hostname: "pub-86382220849d470f82fb89f5becb1993.r2.dev",
      },
    ],
  },
};

export default nextConfig;
