import { redirect } from 'next/navigation';

/** Ruta anterior: el portal de equipo ahora vive en /equipo. */
export default function OrganizadorLegacyPage() {
  redirect('/equipo');
}
