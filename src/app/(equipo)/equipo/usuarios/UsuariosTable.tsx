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
  type SortingFn,
  type SortingState,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { normalizarTexto } from '@/app/(equipo)/equipo/listado-eventos/utils';
import Toast from '@/components/ui/Toast';
import { ZONA_EVENTOS } from '@/lib/fechas-evento';
import type { ResultadoUsuarioEquipo } from '@/types/usuarios-equipo';

import ReenviarInvitacionButton from './ReenviarInvitacionButton';
import type { UsuarioEquipoFila } from './types';

type Props = {
  usuarios: UsuarioEquipoFila[];
  mostrarDependencia: boolean;
  mensajeVacio: string;
};

type Aviso = {
  clave: number;
  mensaje: string;
  tipo: 'exito' | 'error';
};

const VERIFICADO = 'Verificado';
const PENDIENTE = 'Pendiente de verificación';
const ESTADOS = [VERIFICADO, PENDIENTE] as const;
const SIN_DEPENDENCIA = 'Sin dependencia';

const incluyeSeleccion: FilterFn<UsuarioEquipoFila> = (row, columnId, valores) => {
  const seleccion = Array.isArray(valores) ? (valores as string[]) : [];
  return (
    seleccion.length === 0 || seleccion.includes(String(row.getValue(columnId)))
  );
};

const filtroPorNombreOCorreo: FilterFn<UsuarioEquipoFila> = (
  row,
  _columnId,
  valor,
) => {
  const busqueda = normalizarTexto(String(valor ?? ''));
  if (!busqueda) return true;

  return (
    normalizarTexto(row.original.nombre_admin).includes(busqueda) ||
    normalizarTexto(row.original.correo_admin).includes(busqueda)
  );
};

/** Ascendente deja primero a los pendientes; descendente invierte el orden. */
const ordenarEstado: SortingFn<UsuarioEquipoFila> = (a, b, columnId) => {
  const valorA = a.getValue(columnId) === PENDIENTE ? 0 : 1;
  const valorB = b.getValue(columnId) === PENDIENTE ? 0 : 1;
  return valorA - valorB;
};

function textoEstado(verificado: boolean): string {
  return verificado ? VERIFICADO : PENDIENTE;
}

function textoDependencia(fila: UsuarioEquipoFila): string {
  return fila.nombre_dependencia ?? SIN_DEPENDENCIA;
}

function formatearInvitacion(valor: string | null): string | null {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;

  return new Intl.DateTimeFormat('es-MX', {
    timeZone: ZONA_EVENTOS,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha);
}

function GrupoFiltros({
  titulo,
  opciones,
  conteos,
  seleccionados,
  onAlternar,
}: {
  titulo: string;
  opciones: readonly string[];
  conteos: Map<string, number>;
  seleccionados: string[];
  onAlternar: (valor: string) => void;
}) {
  return (
    <fieldset className="min-w-40">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {titulo}
      </legend>
      <div className="space-y-1.5">
        {opciones.map((opcion) => (
          <label
            key={opcion}
            className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={seleccionados.includes(opcion)}
              onChange={() => onAlternar(opcion)}
              className="h-4 w-4 rounded border-slate-300 accent-[var(--color-primary)]"
            />
            <span className="flex-1">{opcion}</span>
            <span className="text-xs text-slate-400">{conteos.get(opcion) ?? 0}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function conteosDe(
  columna: Column<UsuarioEquipoFila> | undefined,
): Map<string, number> {
  if (!columna) return new Map<string, number>();
  return columna.getFacetedUniqueValues() as Map<string, number>;
}

export default function UsuariosTable({
  usuarios,
  mostrarDependencia,
  mensajeVacio,
}: Props) {
  const router = useRouter();
  const sufijo = mostrarDependencia ? 'organizadores' : 'administradores';

  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'nombre', desc: false },
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const cerrarAviso = useCallback(() => setAviso(null), []);
  const manejarResultado = useCallback(
    (resultado: ResultadoUsuarioEquipo, correo: string) => {
      setAviso({
        clave: Date.now(),
        mensaje: resultado.ok
          ? `Invitación reenviada a ${correo}`
          : resultado.error,
        tipo: resultado.ok ? 'exito' : 'error',
      });
      // La acción ya revalidó ambas listas; esto actualiza la vista actual.
      router.refresh();
    },
    [router],
  );

  const dependencias = useMemo(
    () =>
      Array.from(new Set(usuarios.map(textoDependencia))).sort((a, b) =>
        a.localeCompare(b, 'es-MX'),
      ),
    [usuarios],
  );

  const columnas = useMemo<ColumnDef<UsuarioEquipoFila>[]>(() => {
    const columnasBase: ColumnDef<UsuarioEquipoFila>[] = [
      {
        id: 'nombre',
        accessorKey: 'nombre_admin',
        header: 'Nombre',
        cell: ({ row }) => (
          <span className="font-medium text-slate-800">
            {row.original.nombre_admin}
          </span>
        ),
      },
      {
        id: 'correo',
        accessorKey: 'correo_admin',
        header: 'Correo',
        cell: ({ row }) => (
          <a
            href={`mailto:${row.original.correo_admin}`}
            className="text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            {row.original.correo_admin}
          </a>
        ),
      },
    ];

    if (mostrarDependencia) {
      columnasBase.push({
        id: 'dependencia',
        accessorFn: textoDependencia,
        header: 'Dependencia',
        filterFn: incluyeSeleccion,
      });
    }

    columnasBase.push(
      {
        id: 'estado',
        accessorFn: (fila) => textoEstado(fila.verificado),
        header: 'Estado',
        filterFn: incluyeSeleccion,
        sortingFn: ordenarEstado,
        cell: ({ row }) => {
          const pendiente = !row.original.verificado;
          const fecha = pendiente
            ? formatearInvitacion(row.original.invitado_en)
            : null;

          return (
            <div className="space-y-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                  pendiente
                    ? 'bg-amber-50 text-amber-800 ring-amber-600/30'
                    : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                }`}
              >
                <span aria-hidden="true">{pendiente ? '⏳' : '✓'}</span>
                {textoEstado(row.original.verificado)}
              </span>
              {fecha ? (
                <p className="text-xs text-slate-500">Invitado el {fecha}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.verificado ? null : (
            <ReenviarInvitacionButton
              idAdministrador={row.original.id_administrador}
              nombre={row.original.nombre_admin}
              correo={row.original.correo_admin}
              onResultado={manejarResultado}
            />
          ),
      },
    );

    return columnasBase;
  }, [mostrarDependencia, manejarResultado]);

  // TanStack Table devuelve helpers inestables por diseño; el estado se controla con useState.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: usuarios,
    columns: columnas,
    state: { globalFilter, columnFilters, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn: filtroPorNombreOCorreo,
    filterFns: { incluyeSeleccion },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (fila) => String(fila.id_administrador),
  });

  useEffect(() => {
    setPagination((anterior) => ({ ...anterior, pageIndex: 0 }));
  }, [globalFilter, columnFilters]);

  function seleccionDe(columnaId: string): string[] {
    return (
      (table.getColumn(columnaId)?.getFilterValue() as string[] | undefined) ??
      []
    );
  }

  function alternarFiltro(columnaId: string, valor: string) {
    const columna = table.getColumn(columnaId);
    if (!columna) return;

    const actuales = seleccionDe(columnaId);
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
              htmlFor={`buscar-${sufijo}`}
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Buscar usuario
            </label>
            <input
              id={`buscar-${sufijo}`}
              type="search"
              value={globalFilter}
              onChange={(evento) => setGlobalFilter(evento.target.value)}
              placeholder="Buscar por nombre o correo"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <GrupoFiltros
              titulo="Estado"
              opciones={ESTADOS}
              conteos={conteosDe(table.getColumn('estado'))}
              seleccionados={seleccionDe('estado')}
              onAlternar={(valor) => alternarFiltro('estado', valor)}
            />
            {mostrarDependencia ? (
              <GrupoFiltros
                titulo="Dependencia"
                opciones={dependencias}
                conteos={conteosDe(table.getColumn('dependencia'))}
                seleccionados={seleccionDe('dependencia')}
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
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
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
                        className="whitespace-nowrap px-4 py-3 align-middle text-slate-700"
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
                    {mensajeVacio}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <label htmlFor={`tamano-pagina-${sufijo}`}>Mostrar</label>
            <select
              id={`tamano-pagina-${sufijo}`}
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

      {aviso ? (
        <Toast
          key={aviso.clave}
          mensaje={aviso.mensaje}
          tipo={aviso.tipo}
          onClose={cerrarAviso}
        />
      ) : null}
    </div>
  );
}
