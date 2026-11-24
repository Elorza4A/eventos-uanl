import type { EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

const DESTINO_INVITACION = '/establecer-contrasena';
const URL_ERROR = '/establecer-contrasena?error=confirmacion';

/** Solo rutas relativas internas: evita redirecciones abiertas. */
function urlInterna(ruta: string, request: Request): URL {
  return new URL(ruta, request.url);
}

/**
 * Confirma el enlace de invitación de Supabase Auth y abre una sesión para
 * que el invitado pueda establecer su contraseña.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const tipo = searchParams.get('type') as EmailOtpType | null;
  const codigo = searchParams.get('code');
  const next = searchParams.get('next');

  if (next !== DESTINO_INVITACION) {
    return NextResponse.redirect(urlInterna(URL_ERROR, request));
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (codigo) {
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) {
      return NextResponse.redirect(urlInterna(DESTINO_INVITACION, request));
    }
  }

  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: tipo,
    });
    if (!error) {
      return NextResponse.redirect(urlInterna(DESTINO_INVITACION, request));
    }
  }

  console.error('[auth] No se pudo confirmar el enlace de invitación.');
  return NextResponse.redirect(urlInterna(URL_ERROR, request));
}
