import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // 👈 đây là phần quan trọng
  distDir: 'out',   // 👈 thư mục build ra cho Capacitor dùng
};

export default nextConfig;
