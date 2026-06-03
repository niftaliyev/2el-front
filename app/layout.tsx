import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, MobileBottomNav } from "@/components/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from 'sonner';
import TrafficTracker from "@/components/features/TrafficTracker";
import { getSiteUrl } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    title: {
      default: "2El.az - Azərbaycanın ən böyük elan saytı",
      template: "%s | 2El.az",
    },
    description: "Asan, sürətli və etibarlı alış-verişin ünvanı. Nəqliyyat, daşınmaz əmlak, elektronika və daha çox.",
    alternates: {
      canonical: siteUrl,
    },
    keywords: "elanlar, 2El.az, elanlar, pulsuz elan, ikinci el, daşınmaz əmlak, maşın elanları, iş elanları, ticarət, satmaq, almaq",
    authors: [{ name: "2El.az" }],
    creator: "2El.az",
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
}

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "2El.az",
                "url": "https://2el.az",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://2el.az/elanlar?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "2El.az",
                "url": "https://2el.az",
                "logo": "https://2el.az/logo.png",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+994-50-123-45-67",
                  "contactType": "customer service",
                  "areaServed": "AZ",
                  "availableLanguage": ["Azerbaijani", "Russian"]
                }
              }
            ])
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom,0px))] md:pb-0`}
      >
        <div className="flex flex-col min-h-screen w-full relative">
          <LanguageProvider>
            <AuthProvider>
              <TrafficTracker />
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

