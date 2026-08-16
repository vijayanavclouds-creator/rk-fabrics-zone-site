import { PrismaClient } from '@prisma/client';
import { maskImageUrl } from './image-mask';

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
  if (url && !url.startsWith("prisma://") && !url.includes("accelerate") && !url.includes("connection_limit") && !url.includes("pgbouncer")) {
    url += (url.includes("?") ? "&" : "?") + "connection_limit=1&pool_timeout=20";
  }
  const client = new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
  });

  return client;
};

type PrismaClientWithExtensions = ReturnType<typeof prismaClientSingleton>;

declare global {
  var prismaGlobal6: undefined | PrismaClientWithExtensions;
}

const prisma = globalThis.prismaGlobal6 ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal6 = prisma;
}
