// Fixed: Root layout with Sonner Toaster
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "URL Shortener",
  description: "A simple URL shortener application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="mx-auto max-w-6xl p-4 md:p-8">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
