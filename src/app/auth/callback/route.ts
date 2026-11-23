import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login/asistente', request.url));
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL('/login/asistente', request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login/asistente', request.url));
  }

  const { data: asistente } = await supabase
    .from('asistentes')
    .select('id_asistente')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (!asistente) {
    const metadata = user.user_metadata;
    const nombre = typeof metadata.nombre === 'string' ? metadata.nombre : '';
    const idEstado =
      typeof metadata.id_estado === 'number' ? metadata.id_estado : null;
    const idMunicipio =
      typeof metadata.id_municipio === 'number'
        ? metadata.id_municipio
        : null;
    const idFacultad =
      typeof metadata.id_facultad === 'number'
        ? metadata.id_facultad
        : null;
    const edad =
      typeof metadata.edad === 'number' ? metadata.edad : null;
    const idGenero =
      typeof metadata.id_genero === 'number' ? metadata.id_genero : null;

    const { error: perfilError } = await supabase.rpc(
      'registrar_asistente_uanl',
      {
        p_nombre: nombre,
        p_id_facultad: idFacultad,
        p_id_estado: idEstado,
        p_id_municipio: idMunicipio,
        p_edad: edad,
        p_id_genero: idGenero,
        p_direccion: null,
      },
    );

    if (perfilError) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login/asistente', request.url));
    }
  }

  return NextResponse.redirect(new URL('/inicio', request.url));
}
