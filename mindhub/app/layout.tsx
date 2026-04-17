import type { ReactNode } from "react";
import "@/app/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="page-shell">{children}</div>
      </body>
    </html>
  );
}
