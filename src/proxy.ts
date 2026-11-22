import type { NextRequest } from 'next/server';

import { getRouteRule } from '@/config/permissions';
import { createClient, redirectWithCookies } from '@/utils/supabase/proxy';

/**
 * Next.js 16: `middleware.ts` pasa a llamarse `proxy.ts`.
 * Comprobación optimista: solo decide si hace falta sesión; la autorización
 * real por rol se hace en el DAL (`src/lib/dal.ts`) y en cada página/action.
 */
export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const rule = getRouteRule(pathname);

  if (rule && !user) {
    const loginUrl = new URL(rule.loginPath, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return redirectWithCookies(loginUrl, response);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
