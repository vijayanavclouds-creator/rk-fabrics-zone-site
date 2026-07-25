import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL;
  if (url && !url.includes("connection_limit") && !url.includes("pgbouncer")) {
    url += (url.includes("?") ? "&" : "?") + "connection_limit=1&pool_timeout=20";
  }
  return new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
  });
};

declare global {
  var prismaGlobal6: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal6 ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal6 = prisma;
}
