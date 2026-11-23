import Navbar from '@/components/layout/NavBar';
import { getCurrentUser } from '@/lib/dal';

/** Resuelve la sesión real en el servidor y la paso al navbar cliente. */
export default async function NavBarServer() {
  const user = await getCurrentUser();

  return (
    <Navbar
      user={
        user
          ? {
              nombre: user.nombre,
              email: user.email,
              rol: user.rol,
            }
          : null
      }
    />
  );
}
