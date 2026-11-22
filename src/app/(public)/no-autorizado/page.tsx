import Link from 'next/link';

export default function NoAutorizadoPage() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">
        Acceso restringido
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        No tienes permiso para ver esta sección
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
        Tu rol no está autorizado para esta pantalla. Si crees que se trata de un
        error, contacta al administrador del sistema.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary)]"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
