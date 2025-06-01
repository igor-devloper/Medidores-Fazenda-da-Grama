import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Navbar } from "@/app/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sistema de Monitoramento de Medidores - Fazenda da Grama",
  description: "Monitoramento em tempo real de medidores de energia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
