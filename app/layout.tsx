import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "요새여기 - 로스터리 카페 가이드 | 전국 스페셜티 커피";
const DESCRIPTION =
  "서울・부산・제주・인천・강원・경기 등 전국 스페셜티 로스터리 카페를 지역별로 모아보는 가이드, 요새여기. 핸드드립·필터커피가 확인된 곳만 소개합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: ["/brand/flower-mark.png"],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/brand/flower-mark.png"],
  },
  verification: {
    google: "Tw7H1Q7VIxb-pzkRcdpLF_qISNQaOrj1DgqEcz944nc",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
