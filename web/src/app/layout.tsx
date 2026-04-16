import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "VPA - Đấu giá biển số xe ô tô trực tuyến",
  description:
    "Nền tảng đấu giá biển số xe ô tô trực tuyến chính thức của Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        <AuthProvider>
          <Header />
          <main className="flex-1">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
