import { createClient } from '@/utils/supabase/client';

export type EstadoCatalogo = {
  id_estado: number;
  nombre_estado: string;
};

export type MunicipioCatalogo = {
  id_municipio: number;
  nombre_municipio: string;
  id_estado: number;
};

export type FacultadCatalogo = {
  id_facultad: number;
  nombre_facultad: string;
};

export type GeneroCatalogo = {
  id_genero: number;
  nombre_genero: string;
};

export async function obtenerEstados(): Promise<EstadoCatalogo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('estados')
    .select('id_estado,nombre_estado')
    .order('nombre_estado');

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function obtenerMunicipios(
  idEstado: number,
): Promise<MunicipioCatalogo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('municipios')
    .select('id_municipio,nombre_municipio,id_estado')
    .eq('id_estado', idEstado)
    .order('nombre_municipio');

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function obtenerFacultades(): Promise<FacultadCatalogo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('facultades')
    .select('id_facultad,nombre_facultad')
    .order('nombre_facultad');

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function obtenerGeneros(): Promise<GeneroCatalogo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('genero')
    .select('id_genero,nombre_genero')
    .order('nombre_genero');

  if (error) throw new Error(error.message);
  return data ?? [];
}
