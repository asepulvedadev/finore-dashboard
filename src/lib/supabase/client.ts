import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

/**
 * Cliente de Supabase para componentes del lado del cliente
 *
 * @returns Cliente configurado para componentes React
 */
export function createClient() {
  return createClientComponentClient<Database>();
}