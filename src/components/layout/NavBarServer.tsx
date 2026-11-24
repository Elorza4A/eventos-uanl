import Navbar from '@/components/layout/NavBar';
import { getCurrentUser } from '@/lib/dal';
import { getAsistenteActual } from '@/lib/eventos-db';

/** Resuelve la sesión real en el servidor y la pasa al navbar cliente. */
export default async function NavBarServer() {
  const user = await getCurrentUser();
  const asistente = user ? await getAsistenteActual() : null;
  const displayName = user
    ? user.nombre?.trim() || asistente?.nombre || user.email
    : null;

  return (
    <Navbar
      user={
        user
          ? {
              nombre: displayName ?? "",
              email: user.email,
              rol: user.rol,
            }
          : null
      }
    />  
  );
}
