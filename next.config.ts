import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Notion 호스팅 이미지는 만료 URL이라 최적화 대신 원본 <img>로 사용
  reactStrictMode: true,
};

export default nextConfig;
