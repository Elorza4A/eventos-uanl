import { getCurrentUser } from '@/lib/dal';
import { getAsistenteActual } from '@/lib/eventos-db';
import Navbar from '@/components/layout/NavBar';

/** El navbar cliente maneja hoy sus propias ligas; este wrapper solo lo monta. */
export default async function NavBarServer() {
  const user = await getCurrentUser();
  const asistente = user ? await getAsistenteActual() : null;
  const displayName = user
    ? user.nombre || asistente?.nombre || user.email
    : null;

  return (
    <Navbar
      user={
        user
          ? {
              nombre: displayName ?? "",
              email: user.email,
            }
          : null
      }
    />  
  );
}
