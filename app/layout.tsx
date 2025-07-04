import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solar Car Telemetry Dashboard",
  description: "Live telemetry monitoring for solar powered vehicle",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          async
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent Dark Reader from causing hydration mismatches
              if (typeof window !== 'undefined') {
                const originalAddEventListener = Element.prototype.addEventListener;
                Element.prototype.addEventListener = function(type, listener, options) {
                  if (type === 'DOMContentLoaded' && listener.toString().includes('darkreader')) {
                    return;
                  }
                  return originalAddEventListener.call(this, type, listener, options);
                };
                
                // Add meta tag to discourage Dark Reader
                const meta = document.createElement('meta');
                meta.name = 'darkreader-lock';
                meta.content = '';
                document.head.appendChild(meta);
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
