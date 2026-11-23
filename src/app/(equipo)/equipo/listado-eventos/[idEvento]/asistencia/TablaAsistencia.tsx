'use client';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { formatearFechaAsistencia } from './formato';
import type { AsistenciaFila } from './schemas';

function marcaTiempo(valor: string | null): number {
  if (!valor) return 0;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? 0 : fecha.getTime();
}

export default function TablaAsistencia({
  asistencias,
}: {
  asistencias: AsistenciaFila[];
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'fecha_asistencia', desc: true },
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const columnas = useMemo<ColumnDef<AsistenciaFila>[]>(
    () => [
      {
        accessorKey: 'nombre_asistente',
        header: 'Nombre',
        cell: ({ getValue }) => (
          <span className="font-medium text-slate-800">
            {String(getValue() ?? '')}
          </span>
        ),
      },
      {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ getValue }) => String(getValue() ?? ''),
      },
      {
        accessorKey: 'facultad',
        header: 'Facultad',
        cell: ({ row }) => row.original.facultad ?? '—',
      },
      {
        accessorKey: 'fecha_asistencia',
        header: 'Hora de asistencia',
        sortingFn: (a, b) =>
          marcaTiempo(a.original.fecha_asistencia) -
          marcaTiempo(b.original.fecha_asistencia),
        cell: ({ getValue }) =>
          formatearFechaAsistencia(getValue() as string | null),
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- Igual que en el listado: TanStack Table devuelve funciones inestables por diseño.
  const table = useReactTable({
    data: asistencias,
    columns: columnas,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filas = table.getRowModel().rows;

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">
        {asistencias.length} asistencias registradas
      </h3>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {table.getHeaderGroups().map((grupo) => (
                <tr key={grupo.id}>
                  {grupo.headers.map((header) => {
                    const orden = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          orden === 'asc'
                            ? 'ascending'
                            : orden === 'desc'
                              ? 'descending'
                              : undefined
                        }
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
                            <span
                              aria-hidden="true"
                              className="text-[var(--color-primary)]"
                            >
                              {orden === 'asc' ? '▲' : orden === 'desc' ? '▼' : '↕'}
                            </span>
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas.length > 0 ? (
                filas.map((fila) => (
                  <tr key={fila.id} className="hover:bg-slate-50">
                    {fila.getVisibleCells().map((celda) => (
                      <td
                        key={celda.id}
                        className="whitespace-nowrap px-4 py-3 text-slate-700"
                      >
                        {flexRender(
                          celda.column.columnDef.cell,
                          celda.getContext(),
                        )}
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
                    Aún no hay asistencias registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <label htmlFor="tamano-pagina-asistencia">Mostrar</label>
            <select
              id="tamano-pagina-asistencia"
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
    </section>
  );
}
