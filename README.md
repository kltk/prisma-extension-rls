# prisma-extension-rls

The Prisma RLS extension enhances Prisma app security by using PostgreSQL's RLS to enforce fine-grained access controls at the database level.

## Installation

```bash
npm install prisma-extension-rls
```

## Usage

### Row Level Security Reference

- [Row Level Security in Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Postgres [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### code example

```ts
// for supabase
import { PrismaClient } from '@prisma/client';
import { supabaseExtension } from 'prisma-extension-rls';

// create client
const prisma = new PrismaClient()
  // extend supabase extension
  .$extends(supabaseExtension);

// get & verify claims
const claims = {
  aud: 'authenticated',
  role: 'authenticated',
  sub: '1',
  // ...
};

// set claims
const claimedClient = prisma.$supabase(claims);
const model = claimedClient[modelName];
```

```ts
// for custom
import { PrismaClient } from '@prisma/client';
import { rlsExtension } from 'prisma-extension-rls';

// create client
const prisma = new PrismaClient()
  // extend rls extension
  .$extends(rlsExtension);

// get rls data
const data = {
  appid: 'appid',
  json: {},
};

// set rls data
const rlsClient = prisma.$rls(data);
const model = rlsClient[modelName];
```
