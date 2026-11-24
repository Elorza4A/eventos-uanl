import { cookies } from 'next/headers';
import Link from 'next/link';

import EstablecerContrasenaForm from '@/components/auth/EstablecerContrasenaForm';
import { createClient } from '@/utils/supabase/server';

type Props = {
  searchParams: Promise<{ error?: string | string[] }>;
};

function EnlaceInvalido({ motivo }: { motivo: string }) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">Enlace no válido</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{motivo}</p>
      <Link
        href="/equipo/login"
        className="mt-6 inline-block rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]"
      >
        Ir al acceso de equipo
      </Link>
    </section>
  );
}

export default async function EstablecerContrasenaPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : null;

  if (error === 'confirmacion') {
    return (
      <EnlaceInvalido motivo="El enlace de invitación venció o ya fue usado. Solicita una nueva invitación." />
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EnlaceInvalido motivo="Tu sesión no está activa. Abre de nuevo el enlace de invitación o inicia sesión." />
    );
  }

  return <EstablecerContrasenaForm correo={user.email ?? ''} />;
}
