import { redirect } from 'next/navigation';

export default async function EventoRedirectPage({
  params,
}: {
  params: Promise<{ idEvento: string }>;
}) {
  const { idEvento } = await params;
  redirect(`/equipo/listado-eventos/${idEvento}/informacion-general`);
}
