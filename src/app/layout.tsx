import type { Metadata } from 'next';
import { Inter, Amaranth } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const amaranth = Amaranth({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-amaranth',
});

export const metadata: Metadata = {
  title: 'Know Your Friend | AI-Powered Friendship Quiz',
  description:
    'Generate witty personal trivia questions using AI, challenge your friends to a single-attempt showdown, and watch live scores on a realtime leaderboard.',
  keywords: ['friend quiz', 'AI trivia', 'know your friend', 'social quiz'],
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${amaranth.variable} antialiased`}>
      <body className="min-h-screen bg-neu-bg text-gray-800 font-sans selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
