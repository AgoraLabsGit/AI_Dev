import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/lib/design-system";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vibe Lab",
  description: "Your AI-powered software architect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
