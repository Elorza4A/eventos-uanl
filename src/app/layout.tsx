import './globals.css';

import QueryProvider from '@/components/providers/QueryProvider';

export const metadata = {
  title: 'Sistema Universitario',
  description: 'Frontend modular desarrollado en Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
        <QueryProvider>
          {/* Cada grupo de rutas aporta su propio shell (AppShell o layout de acceso). */}
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}