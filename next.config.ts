import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  typescript: {
    // !! PELIGRO !!
    // Permite que la aplicación se construya aunque haya errores de TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Advertencia: Esto permite que la compilación se complete incluso con errores de ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
