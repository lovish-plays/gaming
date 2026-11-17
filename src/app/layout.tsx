import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Underground — A Gaming Playstation',
  description: 'Live station status & loyalty rewards for Underground Gaming Lounge',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Underground — A Gaming Playstation',
    description: 'Your underground gaming lounge experience',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030306',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#030306] text-white antialiased selection:bg-neon-green/30 selection:text-white relative">
        {/* ======================================================== */}
        {/* FULL-PAGE IMMERSIVE GAMING STATION BACKGROUND            */}
        {/* ======================================================== */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Authentic Gaming Lounge Station Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: "url('/gaming-bg.jpg')",
              filter: 'brightness(0.75) contrast(1.15)',
            }}
          />
          {/* Dark Vignette & Ambient Gradient Overlays for Maximum Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030306]/85 via-[#030306]/70 to-[#030306]/95" />
          <div className="absolute inset-0 cyber-grid opacity-25" />
          <div className="cyber-orbs" />
        </div>

        {/* Smooth Scrolling Foreground Content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
