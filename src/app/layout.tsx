import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Know Your Friend | AI-Powered Friendship Quiz',
  description:
    'Generate witty personal trivia questions using Google Gemini AI, challenge your friends to a single-attempt showdown, and watch live scores on a realtime leaderboard.',
  keywords: ['friend quiz', 'AI trivia', 'know your friend', 'gemini ai', 'social quiz'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-neu-bg text-gray-800 font-sans selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
