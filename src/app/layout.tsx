import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prontuário PerTe — Per Te Residencial Sênior",
  description:
    "Sistema Clínico e Assistencial de Prontuário Eletrônico — Per Te Residencial Sênior.",
  icons: {
    icon: "/logo-perte.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F5F2EB] text-[#18281E] antialiased selection:bg-[#947743]/20 selection:text-[#143D25]">
        {children}
      </body>
    </html>
  );
}
