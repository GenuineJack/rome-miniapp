import "@/app/globals.css";
import { ThemeClient } from "@/components/theme-client";
import { ProvidersAndInitialization } from "@/features/app/providers-and-initialization";
import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import { ReactNode } from "react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  icons: {
    icon: { url: "https://raw.githubusercontent.com/GenuineJack/genuine-jack-site/main/public/boston-miniapp/favicon.png", type: "image/png" },
    apple: "https://raw.githubusercontent.com/GenuineJack/genuine-jack-site/main/public/boston-miniapp/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${lora.variable}`} suppressHydrationWarning>
      <head>
        <ThemeClient />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ProvidersAndInitialization>{children}</ProvidersAndInitialization>
      </body>
    </html>
  );
}
