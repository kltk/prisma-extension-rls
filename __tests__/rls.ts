import { PrismaClient } from '@prisma/client';
import { rlsExtension, supabaseExtension } from '../src';

const { DATABASE_URL } = process.env;

const id = '10000000-0000-0000-0000-000000000000';
const uid = '20000000-0000-0000-0000-000000000000';
const role = 'authenticated';
const claims = { role, sub: uid };
const context = { role, 'request.jwt.claims': claims };

const client = new PrismaClient()
  .$extends(supabaseExtension)
  .$extends(rlsExtension);

describe('init env', () => {
  test('copy .env to .env.local for workdir', () => {});

  test('must set env for test (edit .env file or cli set)', () =>
    expect(DATABASE_URL).toBeTruthy());

  test('init db from prisma/migrations (npm run prisma:deploy)', () => {});
});

describe('rls extension', () => {
  test('denied for anonymous', async () => {
    const model = client.obj;
    await expect(model.findMany()) //
      .rejects.toThrow(/denied/);
    await expect(model.create({ data: { uid, data: 1 } })) //
      .rejects.toThrow(/denied/);
    await expect(model.update({ where: { id: '1' }, data: { data: 2 } })) //
      .rejects.toThrow(/denied/);
    await expect(model.delete({ where: { id: '1' } })) //
      .rejects.toThrow(/denied/);
  });

  test('must empty after inited db', async () => {
    const model = client.$supabase(claims).obj;
    await expect(model.findMany()) //
      .resolves.toEqual([]);
  });

  test('allow with supabase auth', async () => {
    const model = client.$supabase(claims).obj;
    await expect(model.create({ data: { id, data: 1 } })) //
      .resolves.toEqual({ id, uid, data: 1 });
    await expect(model.update({ where: { id }, data: { data: 2 } })) //
      .resolves.toEqual({ id, uid, data: 2 });
    await expect(model.delete({ where: { id } })) //
      .resolves.toBeTruthy();
    await expect(model.findMany()) //
      .resolves.toEqual([]);
  });

  test('denied with empty context', async () => {
    const model = client.$rls([]).obj;
    await expect(model.findMany()) //
      .rejects.toThrow(/denied/);
  });

  test('allow with custom context', async () => {
    const model = client.$rls(context).obj;
    await expect(model.findMany()) //
      .resolves.toEqual([]);
    await expect(model.create({ data: { id, data: 1 } })) //
      .resolves.toEqual({ id, uid, data: 1 });
    await expect(model.update({ where: { id }, data: { data: 2 } })) //
      .resolves.toEqual({ id, uid, data: 2 });
    await expect(model.delete({ where: { id } })) //
      .resolves.toBeTruthy();
    await expect(model.findMany()) //
      .resolves.toEqual([]);
  });
});
