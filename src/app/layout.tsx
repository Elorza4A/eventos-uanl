import './globals.css';
import Navbar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Sistema Universitario',
  description: 'Frontend modular desarrollado en Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
        <Navbar />
        {/* El contenido dinámico se monta dentro de este <main> */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}