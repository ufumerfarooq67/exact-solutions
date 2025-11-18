// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


import { TooltipProvider } from "@/lib/components/ui/tooltip";



// Optional: Devtools (only in development)
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ClientToaster } from "@/lib/components/ClientToast";
import { QueryProvider } from "@/lib/components/QueryProvider";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "My App", // change this
  description: "The best Next.js app in 2025",
  // add more: icons, openGraph, etc.
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <TooltipProvider>
            <AuthProvider>
              {children}
              <ClientToaster />
              {/* Remove in production if you want */}
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </AuthProvider>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}