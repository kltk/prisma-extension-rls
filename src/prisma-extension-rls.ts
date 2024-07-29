import { Prisma } from '@prisma/client';

type ContextData = Record<string, unknown> | [string, unknown][];

const stringify = (v: unknown = null) => {
  return v !== null
    ? typeof v === 'object'
      ? JSON.stringify(v)
      : String(v)
    : null;
};

const mergeContext = (...args: (ContextData | undefined)[]) =>
  args.flatMap((arg) =>
    arg ? (Array.isArray(arg) ? arg : Object.entries(arg)) : []
  );

export function createContext(initial: ContextData) {
  return Prisma.defineExtension((client) =>
    client.$extends({
      name: 'context',
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const { context, ...rest } = args as typeof args & {
              context?: ContextData;
            };

            const merged = mergeContext(initial, context);
            if (!merged.length) {
              return query(rest);
            }

            const sqlParts = merged.map(
              ([k, v]) => Prisma.sql`SET_CONFIG(${k}, ${stringify(v)}, TRUE)`
            );
            const sql = Prisma.sql`SELECT ${Prisma.join(sqlParts)}`;

            const [, result] = await client.$transaction([
              client.$executeRaw(sql),
              query(rest),
            ]);
            return result;
          },
        },
      },
    })
  );
}

export const rlsExtension = Prisma.defineExtension((client) =>
  client.$extends({
    name: 'rls',
    client: {
      $rls(input: ContextData) {
        return client.$extends(createContext(input));
      },
    },
  })
);
