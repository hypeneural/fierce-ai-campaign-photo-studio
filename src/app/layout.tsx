import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campaign Photo Studio",
  description: "Local-first campaign photo frame studio",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
