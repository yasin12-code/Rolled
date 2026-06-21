import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['firebase-admin', 'jose', 'jwks-rsa'],
};

export default nextConfig;
