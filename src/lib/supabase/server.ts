import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient as createRouteHandler } from '@supabase/auth-helpers-nextjs';
import { createServerActionClient as createServerAction } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * Cliente de Supabase para Server Components
 *
 * @returns Cliente configurado para server components
 */
export function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

/**
 * Cliente de Supabase para Route Handlers (API Routes)
 *
 * @returns Cliente configurado para route handlers
 */
export function createRouteHandlerClient() {
  const cookieStore = cookies();
  return createRouteHandler({ cookies: () => cookieStore });
}

/**
 * Cliente de Supabase para Server Actions
 *
 * @returns Cliente configurado para server actions
 */
export function createServerActionClient() {
  const cookieStore = cookies();
  return createServerAction({ cookies: () => cookieStore });
}