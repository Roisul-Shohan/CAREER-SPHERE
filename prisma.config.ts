import 'dotenv/config';
import { defineConfig } from "prisma/config";
import { PrismaClient } from "@prisma/client";

// Prisma v7: centralize datasource URL in prisma.config.ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // use process.env to avoid Prisma CLI failing when DATABASE_URL isn't set
    url: process.env.DATABASE_URL ?? "",
  },
});

// Create and export a Prisma client instance for the app runtime
const prisma = globalThis.prisma || new PrismaClient({});

if (process.env.NODE_ENV !== "production") {
  // @ts-ignore
  globalThis.prisma = prisma;
}

export { prisma };
