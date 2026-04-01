import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ffmpeg-static', 'yt-dlp-wrap'],
};

export default nextConfig;
