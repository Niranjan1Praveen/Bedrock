import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

/**
 * A single PrismaClient for the process.
 *
 * Next's dev server re-evaluates modules on every edit, and a fresh client per
 * evaluation would leak connections until the pooler refuses new ones. The
 * instance is therefore parked on globalThis in development; production gets a
 * plain module-level singleton.
 *
 * Prisma 7 takes the connection through a driver adapter rather than a `url` in
 * the schema. DATABASE_URL points at Supavisor's transaction pooler, which is
 * what makes this safe to run in serverless functions.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** Model delegate name for a model: `Subject` -> `subject`. */
function delegateName(model: string) {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

/**
 * Whether a cached client predates the current generated client.
 *
 * Caching on globalThis has one sharp edge: run `prisma generate` after adding
 * a model and the running dev server keeps the old instance, which has no
 * delegate for it. That surfaces as `prisma.subject` being undefined and a
 * confusing "cannot read properties of undefined" at the call site, a long way
 * from the actual cause. Comparing the cached instance against the models the
 * freshly imported client knows about catches it and rebuilds instead.
 */
function isStale(client: PrismaClient) {
  try {
    const instance = client as unknown as Record<string, unknown>;
    return Object.values(Prisma.ModelName).some(
      (model) => instance[delegateName(model)] === undefined,
    );
  } catch {
    // A detection helper must never be the thing that breaks the app. If the
    // shape is not what is expected, assume the cached client is fine and let
    // a real query fail with a real error.
    return false;
  }
}

function resolveClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (!cached) return createClient();

  if (isStale(cached)) {
    // Drop the old pool rather than leaving it holding connections.
    void cached.$disconnect().catch(() => {});
    return createClient();
  }
  return cached;
}

export const prisma = resolveClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
