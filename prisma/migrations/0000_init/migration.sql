-- CreateTable
CREATE TABLE "Obj" (
    "id" UUID NOT NULL,
    "uid" UUID NOT NULL DEFAULT (current_setting('request.jwt.claims', TRUE)::jsonb ->> 'sub')::uuid,
    "data" INTEGER NOT NULL,

    CONSTRAINT "Obj_pkey" PRIMARY KEY ("id")
);

-- Enable Row Level Security
ALTER TABLE "Obj" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "Obj" FORCE ROW LEVEL SECURITY;

-- Create role for not exist
-- CREATE ROLE authenticated;
-- Grant `set role authenticated` perm to connected role(authenticator)
-- GRANT authenticated to authenticator;

-- Create row security policies
CREATE POLICY supabase_policy ON "Obj" TO "authenticated" USING ("uid" = (current_setting('request.jwt.claims', TRUE)::jsonb ->> 'sub')::uuid);
