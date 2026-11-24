import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          aria-label="Ir al inicio de EventosUANL"
          className="mb-6 block rounded-lg text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-4"
        >
          <Image
            src="/images/logo-uanl.png"
            alt="Logo de la UANL"
            width={48}
            height={48}
            className="mx-auto h-12 w-12"
          />
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
            Eventos UANL
          </p>
        </Link>
        {children}
      </div>
    </main>
  );
}
