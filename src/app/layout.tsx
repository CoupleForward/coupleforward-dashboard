import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Couple Forward — Membership Dashboard",
  description:
    "The Couple Forward membership dashboard. Daily rituals, live teachings, and tools for the long arc of your relationship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-bg text-cream">{children}</body>
    </html>
  );
}
