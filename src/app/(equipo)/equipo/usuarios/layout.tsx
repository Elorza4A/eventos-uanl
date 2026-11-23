import { requireRole } from '@/lib/dal';

export default async function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(['admin'], '/equipo/login');

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Panel de administración
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="mt-1 text-sm text-slate-600">
          Consulta las cuentas del equipo según su rol.
        </p>
      </header>

      {children}
    </div>
  );
}
