import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HospVita PEP — Sistema Web de Prontuário Eletrônico Hospitalar",
  description:
    "Plataforma hospitalar de Prontuário Eletrônico do Paciente (PEP), Processo de Enfermagem (COFEN 736/2024), Prescrição e Checagem Beira-Leito.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

