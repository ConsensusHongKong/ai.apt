"use client";
import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";

import { ThemeProvider } from "./components/providers/ThemeProvider";
import { WalletProvider } from "./components/providers/WalletProvider";
import { Toaster } from "./components/ui/toaster";
import { useEffect } from "react";
import { useTheme } from "next-themes";


const inter = Inter({ subsets: ["latin"] });

const metadata = {
  title: "MarexAI",
  description: "AI-powered trading agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    try {
      document.documentElement.classList.add('light');
      setTheme("light");
    } catch (e) {}
  }, []);
  
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <WalletProvider>
            <Navbar />
            <div className="h-[calc(100vh-66px)] overflow-y-auto bg-gray-100">{children}</div>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
