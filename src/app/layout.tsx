import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MindHub", template: "%s | MindHub" },
  description: "Agenda segura e inteligente para psicólogas e pacientes.",
  openGraph: {
    title: "MindHub",
    description: "Agenda segura e inteligente para psicólogas e pacientes.",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "https://raw.githubusercontent.com/k100-dev/mindHub/main/public/mindhub-social-card.png",
        width: 1200,
        height: 630,
        alt: "MindHub — Agenda leve. Atendimento no centro.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MindHub",
    description: "Agenda segura e inteligente para psicólogas e pacientes.",
    images: ["https://raw.githubusercontent.com/k100-dev/mindHub/main/public/mindhub-social-card.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
