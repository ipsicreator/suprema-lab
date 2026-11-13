import type { Metadata } from "next";
import "./globals.css";
import SessionProviders from "./components/auth/SessionProviders";

export const metadata: Metadata = {
  title: (process.env.NEXT_PUBLIC_APP_NAME || "수프리마 랩") + " | 학생부 분석·입시 진단",
  description: "학생부 분석·탐구·세특·입시 위치 진단을 연결하는 수프리마 랩",
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
