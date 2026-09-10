import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Portfolio Pulse — Terminal v4.2 | Octa Byte AI',
  description: 'Dynamic Institutional Portfolio Dashboard with real-time market data, TanStack table, Recharts, and 3D Three.js holographic visualizer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#0B0E14] text-[#E1E2EB] font-sans antialiased min-h-screen selection:bg-[#7C5CFC]/30 selection:text-[#E6DEFF] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
