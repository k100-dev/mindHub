import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MindHub", template: "%s | MindHub" },
  description: "Acesso privado para solicitar e acompanhar horários.",
  openGraph: {
    title: "MindHub",
    description: "Acesso privado para solicitar e acompanhar horários.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindHub",
    description: "Acesso privado para solicitar e acompanhar horários.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
