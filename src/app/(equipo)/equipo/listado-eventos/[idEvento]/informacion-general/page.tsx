import { notFound } from 'next/navigation';

import { STAFF_ROLES } from '@/config/permissions';
import BadgeEstatus from '@/components/equipo/BadgeEstatus';
import CancelarEventoButton from '@/components/equipo/CancelarEventoButton';
import ImagenEvento from '@/components/events/ImagenEvento';
import Toast from '@/components/ui/Toast';
import { getPerfil } from '@/lib/auth/perfil';
import { requireRole } from '@/lib/dal';

import { obtenerDetalleEvento } from '../../data';
import {
  formatearDiaEvento,
  formatearFecha,
  formatearHoraEvento,
  textoOGuion,
} from '../../utils';

type Props = {
  params: Promise<{ idEvento: string }>;
  searchParams: Promise<{ creado?: string | string[] }>;
};

function Campo({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string | null;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {etiqueta}
      </dt>
      <dd className="mt-1 whitespace-pre-line text-sm text-slate-800">
        {textoOGuion(valor)}
      </dd>
    </div>
  );
}

export default async function InformacionGeneralPage({
  params,
  searchParams,
}: Props) {
  await requireRole(STAFF_ROLES, '/equipo/login');

  const { idEvento: parametro } = await params;
  if (!/^\d+$/.test(parametro)) notFound();

  const idEvento = Number(parametro);
  if (!Number.isSafeInteger(idEvento) || idEvento <= 0) notFound();

  const perfil = await getPerfil();
  if (!perfil.user || !perfil.equipo) notFound();

  const esAdministrador = perfil.equipo.rol === 'Administrador';
  const evento = await obtenerDetalleEvento(idEvento, {
    esAdministrador,
    idDependencia: perfil.equipo.idDependencia,
  });
  if (!evento) notFound();

  const esCreador =
    perfil.equipo.idAdministrador !== null &&
    evento.idAdministrador !== null &&
    perfil.equipo.idAdministrador === evento.idAdministrador;
  const puedeCancelar =
    !esAdministrador && esCreador && evento.estatus === 'Activo';

  const { creado } = await searchParams;
  const avisoCreacion = creado === '1' ? 'Evento creado correctamente' : null;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Información general
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Detalle del evento registrado en el sistema.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <BadgeEstatus estatus={evento.estatus} />
            {puedeCancelar ? (
              <CancelarEventoButton idEvento={evento.idEvento} />
            ) : null}
          </div>
        </div>

        <dl className="mt-6 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Campo etiqueta="Nombre" valor={evento.nombreEvento} />
          <Campo etiqueta="Dependencia" valor={evento.dependencia} />
          <Campo etiqueta="Organizador (creador)" valor={evento.organizador} />
          <Campo
            etiqueta="Día del evento"
            valor={formatearDiaEvento(evento.fechaInicio ?? evento.fechaFin)}
          />
          <Campo
            etiqueta="Hora inicio"
            valor={formatearHoraEvento(evento.fechaInicio)}
          />
          <Campo
            etiqueta="Hora fin"
            valor={formatearHoraEvento(evento.fechaFin)}
          />
          <Campo
            etiqueta="Fecha de creación"
            valor={formatearFecha(evento.fechaCreacion)}
          />
          <Campo etiqueta="Cupo máximo" valor={textoOGuion(String(evento.cupoMaximo ?? ''))} />
          <Campo etiqueta="Dirección" valor={evento.direccion} />
          <Campo
            etiqueta="Descripción"
            valor={textoOGuion(evento.descripcion)}
          />
        </dl>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900">Imagen</h3>
        <div className="mt-4">
          <ImagenEvento
            url={evento.imagenUrl}
            alt={`Imagen del evento ${evento.nombreEvento}`}
          />
        </div>
      </div>

      <Toast key={avisoCreacion ?? 'sin-aviso'} mensaje={avisoCreacion} />
    </section>
  );
}
