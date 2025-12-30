import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agribook Admin Panel",
  description: "Admin panel for Agribook - Agricultural eBook Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
