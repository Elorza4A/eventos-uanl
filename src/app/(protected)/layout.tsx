import AppShell from '@/components/layout/AppShell';
import { requireUser } from '@/lib/dal';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirección temprana para quien no tiene sesión. Cada página además
  // comprueba su rol con requireRole() y las actions validan por su cuenta.
  await requireUser();

  return <AppShell>{children}</AppShell>;
}
