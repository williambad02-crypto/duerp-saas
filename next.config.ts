import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Évite que @react-pdf/renderer (avec ses dépendances Node.js)
  // ne soit bundlé côté client — il n'est utilisé que dans l'API Route
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
