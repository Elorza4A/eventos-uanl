import HomeContent from '@/components/home/HomeContent';
import { ASSISTANT_ROLES } from '@/config/permissions';
import { requireRole } from '@/lib/dal';

export const dynamic = 'force-dynamic';

export default async function InicioAsistentePage() {
  // La página sigue protegida, pero muestra exactamente el mismo inicio público.
  await requireRole(ASSISTANT_ROLES, '/login');

  return <HomeContent />;
}
