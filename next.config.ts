import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // サーバー処理を持たないため静的エクスポートで配信する（architecture.md 4.1）
  output: "export",
};

export default nextConfig;
