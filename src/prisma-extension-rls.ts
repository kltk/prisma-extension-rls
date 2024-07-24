import { Prisma } from '@prisma/client';

const stringify = (v: unknown = null) => {
  return v !== null
    ? typeof v === 'object'
      ? JSON.stringify(v)
      : String(v)
    : null;
};

export function createContext(configs: [string, string][]) {
  return Prisma.defineExtension((client) =>
    client.$extends({
      name: 'context',
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const sqlParts = configs.map(
              ([k, v]) => Prisma.sql`SET_CONFIG(${k}, ${v}, TRUE)`
            );
            const sql = Prisma.sql`SELECT ${Prisma.join(sqlParts)}`;

            const [, result] = await client.$transaction([
              client.$executeRaw(sql),
              query(args),
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
      $rls(input: Record<string, unknown> | [string, unknown][]) {
        const data = (Array.isArray(input) ? input : Object.entries(input)).map(
          ([k, v]) => [k, stringify(v)] satisfies [string, string]
        );
        return client.$extends(createContext(data));
      },
    },
  })
);
