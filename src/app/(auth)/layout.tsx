import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Image
            src="/images/logo-uanl.png"
            alt="Logo de la UANL"
            width={48}
            height={48}
            className="mx-auto h-12 w-12"
          />
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
            EventosUANL
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
