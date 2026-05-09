'use client';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <html lang="no" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Family Quest" />
        <link rel="manifest" href="/manifest.json" />
        <title>Family Quest</title>
      </head>
      <body className="theme-space min-h-screen">
        <AppProvider>
          <div className="max-w-lg mx-auto relative min-h-screen pb-24">
            {children}
          </div>
          <Navigation />
        </AppProvider>
      </body>
    </html>
  );
}
