import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-montserrat', 
});

export const metadata: Metadata = {
  title: "Техническая поддержка",
  description: "Автоматизированная техническая поддержка",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-theme="mytheme"
      className={`${montserrat.variable} h-full antialiased`}
      
    >
      <body className="min-h-full flex flex-col gap-0">
        {children}
      </body>
    </html>
  );
}