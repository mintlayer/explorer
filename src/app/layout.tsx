import type { Metadata } from "next";
import { PublicEnvScript } from "next-runtime-env";
import { Inter } from "next/font/google";

import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import NetworkProvider from "@/providers/token";
import { Tooltip } from "./_components/tooltip";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Mintlayer (ML) Blockchain Explorer",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body className={`${inter.className}`}>
        <Tooltip id="tooltip" place="top" className="z-[110]" />
        <Tooltip id="tooltip-multiline" className="z-[110] whitespace-pre" />
        <NetworkProvider>
          <div className="fixed top-0 left-0 w-full z-[9999] bg-white border-b border-gray-300">
            <Header />
          </div>
          <main className="pt-[104px] min-h-screen">
            {children}
          </main>
          <Footer />
        </NetworkProvider>
      </body>
    </html>
  );
}
