// frontend/src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Pegamos as variáveis do Vite (import.meta.env).
 * NOTA: em Vite, as variáveis expostas ao browser precisam começar com VITE_.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Mock mínimo do supabase client para evitar erros no dev quando as chaves não existirem.
 * Implementa só os métodos que o app usa (expandir quando precisar).
 */
function createMockSupabase() {
  console.warn(
    "[supabase] env vars not found — using mock supabase client for development"
  );

  return {
    auth: {
      // retorna shape similar ao real: { data: { session } }
      getSession: async () => ({ data: { session: null } }),

      // registra callback; retorna um objeto com unsubscribe (API parecida)
      onAuthStateChange: (callback: (event: any, session: any) => void) => {
        // não haverá mudanças reais no mock, mas devolvemos um "subscription"
        const subscription = {
          data: null,
          unsubscribe: () => {},
        };
        return subscription;
      },

      // métodos usados no projeto (stubbed)
      signInWithOAuth: async (opts: any) => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
    },

    // implementação simples para `.from(...).select(...)` se houver uso
    from: (_table: string) => ({
      select: async (_cols?: string) => ({ data: [], error: null }),
    }),

    // storage (se usado) — retorna objetos com métodos stub
    storage: {
      from: (_bucket: string) => ({
        upload: async (_path: string, _file: any) => ({ data: null, error: null }),
        download: async (_path: string) => ({ data: null, error: null }),
      }),
    },
  } as unknown as SupabaseClient;
}

/**
 * Criamos o client real apenas se as variáveis estiverem definidas.
 * Caso contrário, exportamos o mock acima para evitar crashes no import.
 */
export const supabase: SupabaseClient =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : createMockSupabase();