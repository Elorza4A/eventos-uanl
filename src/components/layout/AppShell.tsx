import { Suspense } from 'react';

import Footer from '@/components/layout/Footer';
import NavBarServer from '@/components/layout/NavBarServer';

/** Shell compartido por las zonas pública y protegida. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense
        fallback={<div className="h-16 shrink-0 border-b border-white/15 bg-[var(--color-navy)]" />}
      >
        <NavBarServer />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>
      <Footer />
    </>
  );
}
