import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "People's Priorities — AI for Constituency Development Planning",
  description:
    "Multilingual AI platform where citizens submit development suggestions and MPs get a ranked, data-backed priority list.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-slate-900">{children}</body>
    </html>
  );
}
