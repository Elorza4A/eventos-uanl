import EquipoHome from '@/components/equipo/EquipoHome';
import { STAFF_ROLES } from '@/config/permissions';
import { requireRole } from '@/lib/dal';

export default async function EquipoPage() {
  const user = await requireRole(STAFF_ROLES, '/equipo/login');
  return <EquipoHome user={user} />;
}
