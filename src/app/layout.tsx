import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AppStateProvider } from "@/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeSim AI - Parallel Finance Simulator",
  description: "Simulate how your career decisions, life choices, and investment options affect your future net worth, cash flow, stress, and financial freedom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#030014] text-slate-100 font-sans selection:bg-cyber-cyan/30 selection:text-cyber-cyan">
        {/* Orbital Background Glows */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-glow-purple animate-aurora opacity-60"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-glow-cyan animate-aurora opacity-50" style={{ animationDelay: '-5s' }}></div>
          <div className="absolute top-[40%] left-[60%] w-[40%] h-[40%] rounded-full bg-glow-pink animate-aurora opacity-40" style={{ animationDelay: '-10s' }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] opacity-75"></div>
        </div>

        {/* State Provider and Components */}
        <AppStateProvider>
          {/* Global Navigation Header */}
          <Navbar />

          {/* Content Wrapper */}
          <main className="relative z-10 flex-1 flex flex-col w-full">
            {children}
          </main>
        </AppStateProvider>
      </body>
    </html>
  );
}
