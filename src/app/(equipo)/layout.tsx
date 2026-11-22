import TeamSidebar from '@/components/equipo/TeamSidebar';
import { STAFF_ROLES } from '@/config/permissions';
import { requireRole } from '@/lib/dal';

/** Shell exclusivo del equipo: sidebar propio, sin navbar de asistentes. */
export default async function EquipoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(STAFF_ROLES, '/equipo/login');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeamSidebar
        rol={user.rol}
        nombre={user.nombre || user.email}
        email={user.email}
      />
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
