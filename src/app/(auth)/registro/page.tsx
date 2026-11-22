import { redirect } from 'next/navigation';

import RegisterForm from '@/components/auth/RegisterForm';
import { getHomeForRole } from '@/config/permissions';
import { getCurrentUser } from '@/lib/dal';

export default async function RegistroPage() {
  const user = await getCurrentUser();
  if (user) redirect(getHomeForRole(user.rol));

  return <RegisterForm />;
}
