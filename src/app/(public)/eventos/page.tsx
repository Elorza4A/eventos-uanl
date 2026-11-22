import LogoutButton from '@/components/auth/LogoutButton';
import { ASSISTANT_ROLES } from '@/config/permissions';
import { requireRole } from '@/lib/dal';

export default async function EventosPage() {
  await requireRole(ASSISTANT_ROLES, '/login');

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Catálogo de eventos</h1>
        <LogoutButton />
      </div>
      <p className="text-gray-600 mb-4">
        Esta página se carga dentro del mismo `main` sin recargar el Navbar ni el Footer.
      </p>
    </div>
  );
}
