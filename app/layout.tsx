import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthInviteHandler from "@/components/AuthInviteHandler";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ruwan Sticker | Walasmulla",
  description: "Sticker application, removal, and custom design at Ruwan Sticker, Beliatta Road, Walasmulla, Sri Lanka. Book an appointment online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-zinc-100 antialiased">
        <AuthInviteHandler />
        {children}
      </body>
    </html>
  );
}
