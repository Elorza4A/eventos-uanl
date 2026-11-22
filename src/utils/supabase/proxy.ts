import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getSupabaseConfig } from './env';

/**
 * Cliente Supabase para Proxy. Ejecuta `auth.getUser()` desde el proxy para
 * refrescar la sesión y propaga las cookies tanto en respuestas normales como
 * en redirects.
 */
export function createClient(request: NextRequest) {
  const { url, key } = getSupabaseConfig();

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  return { supabase, response: supabaseResponse };
}

export function redirectWithCookies(url: URL, source: NextResponse) {
  const redirect = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) =>
    redirect.cookies.set(cookie.name, cookie.value, cookie),
  );
  return redirect;
}
