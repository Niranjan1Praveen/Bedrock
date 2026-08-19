import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

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

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
