import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string | undefined {
  const configuredUrl = process.env.DATABASE_URL;
  // Se estiver configurado com um banco PostgreSQL remoto, utiliza diretamente
  if (configuredUrl && !configuredUrl.startsWith("file:")) {
    return configuredUrl;
  }

  // Em ambientes Serverless (ex.: Vercel), /var/task é somente leitura e /tmp é gravável
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = "/tmp/pep_hospitalar.db";
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "seed_template.db"),
        path.join(process.cwd(), "prisma", "pep_hospitalar.db"),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          fs.copyFileSync(candidate, tmpDbPath);
          break;
        }
      }
    }
    return `file:${tmpDbPath}`;
  }

  return configuredUrl || "file:./pep_hospitalar.db";
}

const resolvedUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(resolvedUrl ? { datasources: { db: { url: resolvedUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
