import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import NetworkProvider from "@/providers/token";
import { Tooltip } from "./_components/tooltip";
import "./globals.css";
import { getNetwork } from "@/utils/network";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Mintlayer (ML) Blockchain Explorer",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const network = getNetwork();
  const runtimeEnvScript = `window.__ENV__ = ${JSON.stringify({ NETWORK: network })};`;

  return (
    <html lang="en" data-network={network}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: runtimeEnvScript }} />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Tooltip id="tooltip" place="top" className="z-40" />
        <Tooltip id="tooltip-multiline" className="z-40 whitespace-pre" />
        <NetworkProvider>
          <Header />
          {children}
          <Footer />
        </NetworkProvider>
      </body>
    </html>
  );
}
