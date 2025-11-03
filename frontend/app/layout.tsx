import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/contexts/I18nContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KontaFlow - Sistema de Contabilidad',
  description: 'Sistema profesional de contabilidad con partida doble',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <I18nProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
