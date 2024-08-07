// layout.tsx

import type { Metadata } from "next";
import { Trispace } from "next/font/google";
import "./globals.css";
import Header from './components/Header'; 
import Filter from "./components/Filters";
import SelectedNews from "./components/SelectedNews";

const tripspace = Trispace({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Daily News Clipping',
  description: 'Notícias mais relevantes do mercado',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={tripspace.className}>
        <main className="px-2 md:px-20">
          <Header />

          <section className="flex justify-between">
            <div className="w-[700px]">
              {children}
              {/* RandomNews */}
            </div>
            <SelectedNews />
          </section>
        </main>
      </body>
    </html>
  );
}
