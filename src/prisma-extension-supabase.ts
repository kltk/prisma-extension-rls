import { Prisma } from '@prisma/client';
import { createContext } from './prisma-extension-rls';

function createSupabaseContext(claims: Record<string, string> | null) {
  return createContext([
    ['role', claims?.role ?? 'anon'],
    ['request.jwt.claims', claims ? JSON.stringify(claims) : ''],
  ]);
}

export const supabaseExtension = Prisma.defineExtension((client) =>
  client.$extends({
    name: 'supabase rls',
    client: {
      $supabase(claims: Record<string, string> | null) {
        return client.$extends(createSupabaseContext(claims));
      },
    },
    model: {
      $allModels: {
        $supabase<T>(this: T, claims: Record<string, string> | null) {
          const { name } = this as { name: Lowercase<Prisma.ModelName> };
          const model = client.$extends(createSupabaseContext(claims))[name];
          return model as unknown as Omit<T, '$supabase'>;
        },
      },
    },
  })
);
