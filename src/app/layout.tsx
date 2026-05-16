import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-context";
import { AuthDialog } from "@/components/auth/auth-dialog";
import "./globals.css";

export const metadata: Metadata = {
  title: "주식투자수익분석 — 당신의 수익률, 시장을 이기고 있나요?",
  description:
    "TWR·MWR, 벤치마크 알파, 섹터 기여도, 드로다운까지. 액티브 개인 투자자를 위한 포트폴리오 분석 데모.",
  openGraph: {
    title: "주식투자수익분석",
    description:
      "TWR·MWR, 벤치마크 알파, 섹터 기여도, 드로다운까지. 액티브 개인 투자자를 위한 포트폴리오 분석 데모.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          {children}
          <AuthDialog />
        </AuthProvider>
      </body>
    </html>
  );
}
