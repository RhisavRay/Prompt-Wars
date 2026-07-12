import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin and its transitive deps (jwks-rsa, jose, etc.) must not be
  // bundled by Turbopack/webpack. They rely on Node.js-specific module
  // resolution that breaks inside the bundler's virtual filesystem.
  serverExternalPackages: ['firebase-admin'],
};

export default nextConfig;

