import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/lib/components/ui/tooltip";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { ClientToaster } from "@/lib/components/client-toast";
import { QueryProvider } from "@/lib/components/query-provider";


// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
  title: "Task Management",
  description: "Manage your TODOs here",
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