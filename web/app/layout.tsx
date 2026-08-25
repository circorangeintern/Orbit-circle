// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Providers from "./providers";
import StyledComponentsRegistry from "./registry";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Analytics from "@/components/Analytics";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Career Map",
  description: "Understand your strengths, interests, and values with smart assessments.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col relative">
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <StyledComponentsRegistry>
          <Providers>
            <ProtectedRoute>{children}</ProtectedRoute>
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}