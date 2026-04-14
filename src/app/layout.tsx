import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#031948",
};

export const metadata: Metadata = {
  title: "SafeAnalyse. — Votre DUERP en ligne, simple et conforme",
  description: "L'outil DUERP guidé pour les PME françaises. Évaluation des risques professionnels simplifiée, conforme au Code du travail. Essai gratuit 14 jours.",
  openGraph: {
    title: "SafeAnalyse. — Votre DUERP en ligne",
    description: "L'outil DUERP guidé pour les PME françaises. Évaluation des risques professionnels simplifiée, conforme au Code du travail.",
    url: "https://duerp-saas.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
