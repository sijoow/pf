import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이승환 — 프론트엔드 · 풀스택 개발자",
  description:
    "UI/UX부터 백엔드·데이터 파이프라인까지. 웹(Next.js)·앱(React Native)·Node 서버를 만드는 풀스택 개발자의 작업 모음.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
