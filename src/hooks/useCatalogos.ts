'use client';

import { useQuery } from '@tanstack/react-query';

import {
  obtenerEstados,
  obtenerMunicipios,
  obtenerFacultades,
  obtenerGeneros,
} from '@/lib/catalogos';

export const catalogosQueryKeys = {
  estados: ['catalogos', 'estados'] as const,
  municipios: (idEstado: number) =>
    ['catalogos', 'municipios', idEstado] as const,
  facultades: ['catalogos', 'facultades'] as const,
  generos: ['catalogos', 'genero'] as const,
};

export function useEstados() {
  return useQuery({
    queryKey: catalogosQueryKeys.estados,
    queryFn: obtenerEstados,
    staleTime: 30 * 60 * 1000,
  });
}

export function useMunicipios(idEstado: number | null) {
  return useQuery({
    queryKey: catalogosQueryKeys.municipios(idEstado ?? 0),
    queryFn: () => obtenerMunicipios(idEstado as number),
    enabled: idEstado !== null,
    staleTime: 30 * 60 * 1000,
  });
}

export function useFacultades() {
  return useQuery({
    queryKey: catalogosQueryKeys.facultades,
    queryFn: obtenerFacultades,
    staleTime: 30 * 60 * 1000,
  });
}

export function useGeneros() {
  return useQuery({
    queryKey: catalogosQueryKeys.generos,
    queryFn: obtenerGeneros,
    staleTime: 30 * 60 * 1000,
  });
}
