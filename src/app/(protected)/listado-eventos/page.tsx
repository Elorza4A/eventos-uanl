import { redirect } from 'next/navigation';

/** Ruta anterior: se conserva como alias de /equipo/listado-eventos. */
export default function ListadoEventosLegacyPage() {
  redirect('/equipo/listado-eventos');
}
