import type { Metadata } from 'next';
import { lora, golosText } from '@/lib/fonts';
import './globals.css';
import { siteUrl, siteName } from '@/lib/site';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: siteName,
  description: 'Лендинг кофейни Кварта',
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ru" className={`${lora.variable} ${golosText.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
