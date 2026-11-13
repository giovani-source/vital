import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const CLOUD_BLOB_FILENAME = "pep_hospitalar_prod_clean_v1.db";
const TMP_DB_PATH = "/tmp/pep_hospitalar.db";

interface CloudSyncState {
  prisma: PrismaClient | undefined;
  cloudUploadedAt: string | null;
  lastPullCheckMs: number;
  syncPromise: Promise<void> | null;
}

const globalForPrisma = globalThis as unknown as CloudSyncState;

function isServerlessEnvironment(): boolean {
  return Boolean(process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function ensureLocalTmpFileExists(): void {
  if (!isServerlessEnvironment()) return;
  if (!fs.existsSync(TMP_DB_PATH)) {
    const candidates = [
      path.join(process.cwd(), "prisma", "seed_template.db"),
      path.join(process.cwd(), "prisma", "pep_hospitalar.db"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        fs.copyFileSync(candidate, TMP_DB_PATH);
        break;
      }
    }
  }
}

function resolveDatabaseUrl(): string | undefined {
  const configuredUrl = process.env.DATABASE_URL;
  if (configuredUrl && !configuredUrl.startsWith("file:")) {
    return configuredUrl;
  }
  if (isServerlessEnvironment()) {
    ensureLocalTmpFileExists();
    return `file:${TMP_DB_PATH}`;
  }
  return configuredUrl || "file:./pep_hospitalar.db";
}

async function uploadTmpDbToCloud(token: string): Promise<void> {
  if (!fs.existsSync(TMP_DB_PATH)) return;
  const buffer = fs.readFileSync(TMP_DB_PATH);
  await fetch(`https://blob.vercel-storage.com/${CLOUD_BLOB_FILENAME}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-api-version": "7",
      "x-add-random-suffix": "0",
      "x-cache-control-max-age": "0",
      "content-type": "application/octet-stream",
    },
    body: buffer,
    cache: "no-store",
  });

  const listRes = await fetch(
    `https://blob.vercel-storage.com?prefix=${CLOUD_BLOB_FILENAME}&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-version": "7",
      },
      cache: "no-store",
    }
  );
  if (listRes.ok) {
    const listData = await listRes.json();
    const latest = listData?.blobs?.[0];
    if (latest?.uploadedAt) {
      globalForPrisma.cloudUploadedAt = latest.uploadedAt;
      globalForPrisma.lastPullCheckMs = Date.now();
    }
  }
}

async function pullFromCloudIfNeeded(client: PrismaClient): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !isServerlessEnvironment()) return;

  const now = Date.now();
  if (
    globalForPrisma.cloudUploadedAt &&
    now - (globalForPrisma.lastPullCheckMs || 0) < 1200
  ) {
    return;
  }

  if (globalForPrisma.syncPromise) {
    await globalForPrisma.syncPromise;
    return;
  }

  globalForPrisma.syncPromise = (async () => {
    try {
      const listRes = await fetch(
        `https://blob.vercel-storage.com?prefix=${CLOUD_BLOB_FILENAME}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-version": "7",
          },
          cache: "no-store",
        }
      );

      if (!listRes.ok) return;
      const listData = await listRes.json();
      const remoteBlob = listData?.blobs?.find(
        (b: { pathname: string }) => b.pathname === CLOUD_BLOB_FILENAME
      );

      if (!remoteBlob) {
        ensureLocalTmpFileExists();
        await uploadTmpDbToCloud(token);
        return;
      }

      if (remoteBlob.uploadedAt !== globalForPrisma.cloudUploadedAt) {
        const dlRes = await fetch(`${remoteBlob.url}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (dlRes.ok) {
          const arrayBuffer = await dlRes.arrayBuffer();
          await client.$disconnect().catch(() => null);
          fs.writeFileSync(TMP_DB_PATH, Buffer.from(arrayBuffer));
          for (const suffix of ["-journal", "-wal", "-shm"]) {
            const aux = `${TMP_DB_PATH}${suffix}`;
            if (fs.existsSync(aux)) {
              fs.unlinkSync(aux);
            }
          }
          await client.$connect().catch(() => null);
          globalForPrisma.cloudUploadedAt = remoteBlob.uploadedAt;
        }
      }
      globalForPrisma.lastPullCheckMs = Date.now();
    } catch (err) {
      console.error("[CLOUD_DB_PULL_ERROR]", err);
    } finally {
      globalForPrisma.syncPromise = null;
    }
  })();

  await globalForPrisma.syncPromise;
}

const WRITE_ACTIONS = new Set([
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "executeRaw",
]);

function createPrismaClient(): PrismaClient {
  const resolvedUrl = resolveDatabaseUrl();
  const client = new PrismaClient({
    ...(resolvedUrl ? { datasources: { db: { url: resolvedUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  client.$use(async (params, next) => {
    await pullFromCloudIfNeeded(client);
    const result = await next(params);

    if (
      WRITE_ACTIONS.has(params.action) &&
      process.env.BLOB_READ_WRITE_TOKEN &&
      isServerlessEnvironment()
    ) {
      try {
        await uploadTmpDbToCloud(process.env.BLOB_READ_WRITE_TOKEN);
      } catch (err) {
        console.error("[CLOUD_DB_PUSH_ERROR]", err);
      }
    }

    return result;
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
