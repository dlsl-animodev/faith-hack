import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Faith: Hack',
  description: 'CLI-style bug report and debug log submission portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${jetbrainsMono.variable} font-mono bg-zinc-950 text-green-400 antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
