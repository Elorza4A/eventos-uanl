'use client';

import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
} from '@tanstack/react-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import BadgeEstatus from '@/components/equipo/BadgeEstatus';
import type { RolEquipo } from '@/types/database';

import { ESTATUS_EVENTO, type EventoFila } from './types';
import {
  compararFechas,
  formatearFecha,
  normalizarTexto,
  textoOGuion,
} from './utils';

type Props = {
  eventos: EventoFila[];
  rol: RolEquipo;
};

const incluyeSeleccion: FilterFn<EventoFila> = (row, columnId, valores) => {
  const seleccion = Array.isArray(valores) ? (valores as string[]) : [];
  return seleccion.length === 0 || seleccion.includes(String(row.getValue(columnId)));
};

const filtroPorNombre: FilterFn<EventoFila> = (row, _columnId, valor) => {
  const busqueda = normalizarTexto(String(valor ?? ''));
  if (!busqueda) return true;
  return normalizarTexto(row.original.nombreEvento).includes(busqueda);
};

function GrupoFiltros({
  titulo,
  opciones,
  conteos,
  seleccionados,
  onAlternar,
  horizontal = false,
}: {
  titulo: string;
  opciones: readonly string[];
  conteos: Map<string, number>;
  seleccionados: string[];
  onAlternar: (valor: string) => void;
  horizontal?: boolean;
}) {
  return (
    <fieldset className="min-w-40">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {titulo}
      </legend>
      <div
        className={
          horizontal
            ? 'flex flex-wrap items-center gap-x-4 gap-y-2'
            : 'space-y-1.5'
        }
      >
        {opciones.map((opcion) => (
          <label
            key={opcion}
            className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={seleccionados.includes(opcion)}
              onChange={() => onAlternar(opcion)}
              className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] accent-[var(--color-primary)]"
            />
            <span className={horizontal ? undefined : 'flex-1'}>{opcion}</span>
            <span className="text-xs text-slate-400">{conteos.get(opcion) ?? 0}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function conteosDe(columna: Column<EventoFila> | undefined): Map<string, number> {
  if (!columna) return new Map<string, number>();
  return columna.getFacetedUniqueValues() as Map<string, number>;
}

export default function EventosTable({ eventos, rol }: Props) {
  const router = useRouter();
  const esAdministrador = rol === 'Administrador';

  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'fechaInicio', desc: true },
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const dependencias = useMemo(
    () =>
      Array.from(
        new Set(
          eventos
            .map((evento) => evento.dependencia)
            .filter((valor) => valor && valor !== '—'),
        ),
      ).sort((a, b) => a.localeCompare(b, 'es-MX')),
    [eventos],
  );

  const columnas = useMemo<ColumnDef<EventoFila>[]>(() => {
    const columnasBase: ColumnDef<EventoFila>[] = [
      {
        accessorKey: 'nombreEvento',
        header: 'Evento',
        cell: ({ row }) => (
          <Link
            href={`/equipo/listado-eventos/${row.original.idEvento}`}
            onClick={(evento) => evento.stopPropagation()}
            onKeyDown={(evento) => evento.stopPropagation()}
            className="font-medium text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            {row.original.nombreEvento}
          </Link>
        ),
      },
      {
        accessorKey: 'fechaInicio',
        header: 'Fecha de inicio',
        sortingFn: (a, b) =>
          compararFechas(a.original.fechaInicio, b.original.fechaInicio),
        cell: ({ getValue }) => formatearFecha(getValue<string | null>()),
      },
      {
        accessorKey: 'fechaFin',
        header: 'Fecha de fin',
        sortingFn: (a, b) =>
          compararFechas(a.original.fechaFin, b.original.fechaFin),
        cell: ({ getValue }) => formatearFecha(getValue<string | null>()),
      },
      esAdministrador
        ? {
            accessorKey: 'dependencia',
            header: 'Dependencia',
            enableSorting: false,
            filterFn: incluyeSeleccion,
          }
        : {
            accessorKey: 'organizador',
            header: 'Organizador',
            enableSorting: false,
          },
      {
        accessorKey: 'cupoMaximo',
        header: 'Cupo máximo',
        cell: ({ getValue }) => textoOGuion(String(getValue<number | null>() ?? '')),
      },
      {
        accessorKey: 'estatus',
        header: 'Estatus',
        enableSorting: false,
        filterFn: incluyeSeleccion,
        cell: ({ row }) => <BadgeEstatus estatus={row.original.estatus} />,
      },
    ];

    return columnasBase;
  }, [esAdministrador]);

  // TanStack Table devuelve helpers inestables por diseño; el estado de la
  // tabla se controla con useState y no se memoiza el objeto resultante.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: eventos,
    columns: columnas,
    state: { globalFilter, columnFilters, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn: filtroPorNombre,
    filterFns: { incluyeSeleccion },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    setPagination((anterior) => ({ ...anterior, pageIndex: 0 }));
  }, [globalFilter, columnFilters]);

  const seleccionEstatus =
    (table.getColumn('estatus')?.getFilterValue() as string[] | undefined) ?? [];
  const seleccionDependencia = esAdministrador
    ? ((table.getColumn('dependencia')?.getFilterValue() as
        | string[]
        | undefined) ?? [])
    : [];

  function alternarFiltro(columnId: string, valor: string) {
    const columna = table.getColumn(columnId);
    if (!columna) return;
    const actuales =
      (columna.getFilterValue() as string[] | undefined) ?? [];
    const siguientes = actuales.includes(valor)
      ? actuales.filter((item) => item !== valor)
      : [...actuales, valor];
    columna.setFilterValue(siguientes.length > 0 ? siguientes : undefined);
  }

  function limpiarFiltros() {
    setGlobalFilter('');
    setColumnFilters([]);
  }

  const filas = table.getRowModel().rows;
  const totalFiltrado = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full lg:max-w-sm">
            <label
              htmlFor="buscar-evento"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Buscar evento
            </label>
            <input
              id="buscar-evento"
              type="search"
              value={globalFilter}
              onChange={(evento) => setGlobalFilter(evento.target.value)}
              placeholder="Buscar por nombre del evento"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <GrupoFiltros
              titulo="Estatus"
              opciones={ESTATUS_EVENTO}
              conteos={conteosDe(table.getColumn('estatus'))}
              seleccionados={seleccionEstatus}
              onAlternar={(valor) => alternarFiltro('estatus', valor)}
              horizontal
            />
            {esAdministrador ? (
              <GrupoFiltros
                titulo="Dependencia"
                opciones={dependencias}
                conteos={conteosDe(table.getColumn('dependencia'))}
                seleccionados={seleccionDependencia}
                onAlternar={(valor) => alternarFiltro('dependencia', valor)}
              />
            ) : null}
            <button
              type="button"
              onClick={limpiarFiltros}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {table.getHeaderGroups().map((grupo) => (
                <tr key={grupo.id}>
                  {grupo.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3"
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-slate-800"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <span aria-hidden="true" className="text-[var(--color-primary)]">
                            {header.column.getIsSorted() === 'asc'
                              ? '▲'
                              : header.column.getIsSorted() === 'desc'
                                ? '▼'
                                : '↕'}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas.length > 0 ? (
                filas.map((fila) => (
                  <tr
                    key={fila.id}
                    tabIndex={0}
                    onClick={() =>
                      router.push(
                        `/equipo/listado-eventos/${fila.original.idEvento}`,
                      )
                    }
                    onKeyDown={(evento) => {
                      if (evento.key === 'Enter' || evento.key === ' ') {
                        evento.preventDefault();
                        router.push(
                          `/equipo/listado-eventos/${fila.original.idEvento}`,
                        );
                      }
                    }}
                    className="cursor-pointer transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
                  >
                    {fila.getVisibleCells().map((celda) => (
                      <td key={celda.id} className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {flexRender(celda.column.columnDef.cell, celda.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={table.getAllLeafColumns().length}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No hay eventos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <label htmlFor="tamano-pagina">Mostrar</label>
            <select
              id="tamano-pagina"
              value={pagination.pageSize}
              onChange={(evento) =>
                setPagination({
                  pageIndex: 0,
                  pageSize: Number(evento.target.value),
                })
              }
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
            >
              {[10, 20, 50].map((tamano) => (
                <option key={tamano} value={tamano}>
                  {tamano}
                </option>
              ))}
            </select>
            <span>
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {Math.max(table.getPageCount(), 1)}
            </span>
            <span className="text-slate-400">
              {totalFiltrado} {totalFiltrado === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
