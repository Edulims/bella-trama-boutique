import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Body / UI font — neutral, geometric, very legible
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Display font — premium, editorial. Usada em títulos de produtos e seções nobres.
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Simplifica.IA",
    template: "%s — Simplifica.IA",
  },
  description:
    "Gestão inteligente para pequenos comércios. Catálogo digital, pedidos via WhatsApp e insights com IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${dmSerif.variable} font-sans antialiased bg-stone-50 text-stone-900`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
