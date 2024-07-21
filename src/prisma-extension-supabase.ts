import { Prisma } from '@prisma/client';
import { createContext } from './prisma-extension-rls';

export const supabaseExtension = Prisma.defineExtension((client) =>
  client.$extends({
    name: 'supabase rls',
    client: {
      $supabase(claims: Record<string, string> | null) {
        return client.$extends(
          createContext([
            ['role', claims?.role ?? 'anon'],
            ['request.jwt.claims', claims ? JSON.stringify(claims) : ''],
          ])
        );
      },
    },
  })
);
