import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MindHub", template: "%s | MindHub" },
  description: "Agenda segura e inteligente para psicólogas e pacientes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
