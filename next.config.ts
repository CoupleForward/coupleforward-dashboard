import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let devices on the local network (iPad/phone hitting the Mac's LAN IP)
  // load dev assets; without this, Next blocks them and pages never
  // hydrate off-localhost. Dev-only setting, ignored in production builds.
  allowedDevOrigins: ["192.168.4.152", "*.local"],
};

export default nextConfig;
