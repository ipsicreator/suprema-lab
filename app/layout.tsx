import type { Metadata } from "next";
import "./globals.css";
import SessionProviders from "./components/auth/SessionProviders";

export const metadata: Metadata = {
  title: "수프리마 AI 입시 플랫폼",
  description: "입시 위치진단과 AI 학생부 분석을 통합 운영하는 수프리마 AI 입시 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>
        <SessionProviders>{children}</SessionProviders>
        {/* Force Enable Copy/Paste/Selection Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const allowEvent = (e) => e.stopImmediatePropagation();
                document.addEventListener('copy', allowEvent, true);
                document.addEventListener('cut', allowEvent, true);
                document.addEventListener('paste', allowEvent, true);
                document.addEventListener('contextmenu', allowEvent, true);
                document.addEventListener('selectstart', allowEvent, true);
                document.addEventListener('mousedown', (e) => {
                  if (e.detail > 1) e.preventDefault(); // Keep double click selection
                }, true);
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
