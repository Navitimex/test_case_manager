import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'TestFlow — Test Case Manager',
  description: 'Modern QA Test Case Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full bg-[#F4F5F7] text-[#172B4D] font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
