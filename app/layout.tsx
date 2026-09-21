import type React from "react";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/modules/shared/components/ui/toaster";
import { ThemeProvider } from "@/modules/shared/components/theme-provider";
import { DataProvider } from "@/providers/data-provider";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DataProvider>
            {children}
            <Toaster />
            <Analytics />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
