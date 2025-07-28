import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import { Tooltip } from "./_components/tooltip";
import NetworkProvider from "../providers/token";
import { PublicEnvScript } from "next-runtime-env";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mintlayer Explorer",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Tooltip id="tooltip" place="top" className="z-[110]" />
        <Tooltip id="tooltip-multiline" className="z-[110] whitespace-pre" />
        <NetworkProvider>
          <Header />
          {children}
          <Footer />
        </NetworkProvider>
      </body>
    </html>
  );
}
