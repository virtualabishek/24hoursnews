import { PrismaClient } from "../../lib/generated/prisma/client.js";

declare global {
  var prisma: PrismaClient | undefined;
}
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
