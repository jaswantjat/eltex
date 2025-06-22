import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELTEX Webhook Form - Phone Number Automation Testing",
  description: "Professional webhook testing form for Make.com and n8n phone number automation workflows. Generate JSON payloads and test Spanish vs Foreign number detection logic with ELTEX's automation platform.",
  keywords: ["ELTEX", "webhook", "automation", "Make.com", "n8n", "phone number", "Spanish", "testing", "workflow", "integration"],
  authors: [{ name: "ELTEX" }],
  creator: "ELTEX",
  publisher: "ELTEX",
  icons: {
    icon: "/eltex-logo.svg",
    shortcut: "/eltex-logo.svg",
    apple: "/eltex-logo.svg",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/eltex-logo.svg",
    },
  },
  themeColor: "#6366f1",
  colorScheme: "light",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
