import Navbar from '@/components/layout/NavBar';
import { ROLE_LABELS, visibleLinks } from '@/config/permissions';
import { getCurrentUser } from '@/lib/dal';

/** Obtiene la sesión en el servidor y se la pasa al Navbar cliente. */
export default async function NavBarServer() {
  const user = await getCurrentUser();

  return (
    <Navbar
      links={visibleLinks(user?.rol)}
      user={
        user
          ? {
              nombre: user.nombre || user.email,
              rolLabel: ROLE_LABELS[user.rol],
            }
          : null
      }
    />
  );
}
