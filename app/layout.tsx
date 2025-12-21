import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    template: "%s | Nobita URL Shortener",
    default: "Nobita URL Shortener - Create Short Links Instantly",
  },
  description:
    "A secure and efficient URL shortening service with custom IDs, analytics, and user accounts. Create and manage your shortened links with ease.",
  keywords: [
    "URL shortener",
    "link management",
    "custom URLs",
    "URL redirection",
  ],
  authors: [{ name: "Nobita Shortener Team" }],
  creator: "Nobita Shortener",
  publisher: "Nobita Shortener",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Nobita URL Shortener",
    description:
      "A secure and efficient URL shortening service with custom IDs, analytics, and user accounts.",
    type: "website",
    siteName: "Nobita URL Shortener",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nobita URL Shortener",
    description: "Create and manage shortened URLs with our secure platform",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="mx-auto max-w-6xl p-4 md:p-8">
        <Header />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
