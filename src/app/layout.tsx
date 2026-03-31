import "@/app/globals.css";
import { ThemeClient } from "@/components/theme-client";
import { ProvidersAndInitialization } from "@/features/app/providers-and-initialization";
import { Montserrat, Lora, Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeClient />
        <link rel="icon" type="image/png" href="https://raw.githubusercontent.com/GenuineJack/genuine-jack-site/main/public/boston-miniapp/favicon.png" />
        <link rel="apple-touch-icon" href="https://raw.githubusercontent.com/GenuineJack/genuine-jack-site/main/public/boston-miniapp/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${lora.variable} antialiased`}
        suppressHydrationWarning
      >
        <ProvidersAndInitialization>{children}</ProvidersAndInitialization>
      </body>
    </html>
  );
}
