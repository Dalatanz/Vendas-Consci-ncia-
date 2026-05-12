import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const dm = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Universidade Vendas Consciência",
  description: "Ecossistema de desenvolvimento profissional em vendas, performance e consciência comercial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${dm.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full bg-black font-sans">{children}</body>
    </html>
  );
}
