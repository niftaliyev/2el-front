import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, MobileBottomNav } from "@/components/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "2El.az - Azərbaycanın ən böyük elan saytı",
    template: "%s | 2El.az",
  },
  description: "Asan, sürətli və etibarlı alış-verişin ünvanı. Nəqliyyat, daşınmaz əmlak, elektronika və daha çox.",
  keywords: "elanlar, 2El.az, elanlar, pulsuz elan, ikinci el, daşınmaz əmlak, maşın elanları, iş elanları, ticarət, satmaq, almaq",
  authors: [{ name: "2El.az" }],
  creator: "2El.az",
  // openGraph: {
  //   type: "website",
  //   locale: "az_AZ",
  //   url: "https://2el.az",
  //   siteName: "2El.az",
  //   title: "2El.az - Azərbaycanın ən müasir elan platforması",
  //   description: "Asan, sürətli və etibarlı alış-verişin ünvanı. Nəqliyyat, daşınmaz əmlak, elektronika və daha çox.",
  //   images: [
  //     {
  //       url: "/logo.png",
  //       width: 1200,
  //       height: 630,
  //       alt: "2El.az - Azərbaycanın ən müasir elan saytı",
  //     },
  //   ],
  // },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom,0px))] md:pb-0`}
      >
        <div className="flex flex-col min-h-screen w-full relative">
          <LanguageProvider>
            <AuthProvider>
              <Toaster richColors position="top-right" closeButton />
              <Header />
              <main className="flex-1 flex flex-col w-full relative">
                {children}
              </main>
              <MobileBottomNav />
            </AuthProvider>
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}

