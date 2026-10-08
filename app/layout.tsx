import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LastWar Companion",
  description: "The ultimate toolkit for Last War: Survival players. Arms Race timers, VS Day calculator, training planner and more.",
  keywords: ["Last War", "Last War Survival", "Arms Race", "VS Day", "calculator", "guide"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: "var(--background)", color: "var(--text-primary)" }}>
        <Nav />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}>
          <p>LastWar Companion — Fan-made toolkit. Not affiliated with Last War: Survival or FirstFun.</p>
        </footer>
      </body>
    </html>
  );
}
