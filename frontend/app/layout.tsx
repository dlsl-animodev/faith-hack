import type { Metadata } from 'next';
import './globals.css';
import MatrixBackground from '@/components/MatrixBackground';

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
    <html lang="en" className="dark font-mono">
      <body className="bg-zinc-950 text-green-400 antialiased min-h-screen">
        {/* Matrix rain background — sits at z-index 0, never blocks clicks */}
        <MatrixBackground />
        {/* All page content sits above the canvas */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
