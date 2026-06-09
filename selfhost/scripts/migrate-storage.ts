/**
 * Migra todos os arquivos de Storage do Supabase Cloud para uma instância self-hosted.
 *
 * Uso:
 *   cp .env.migrate.example .env.migrate
 *   # preencher .env.migrate
 *   bun install
 *   bun run migrate-storage.ts
 *
 * Idempotente: re-rodar pula arquivos já presentes no destino.
 * Gera migration-log.csv com o resultado de cada arquivo.
 */
import { createClient } from "@supabase/supabase-js";
import { appendFileSync, writeFileSync, existsSync } from "node:fs";
import { config } from "dotenv";

config({ path: ".env.migrate" });

const {
  SOURCE_URL,
  SOURCE_SERVICE_KEY,
  TARGET_URL,
  TARGET_SERVICE_KEY,
  BUCKETS = "",
  SKIP_EXISTING = "true",
} = process.env;

if (!SOURCE_URL || !SOURCE_SERVICE_KEY || !TARGET_URL || !TARGET_SERVICE_KEY) {
  console.error("❌ Defina SOURCE_* e TARGET_* em .env.migrate");
  process.exit(1);
}

const source = createClient(SOURCE_URL, SOURCE_SERVICE_KEY);
const target = createClient(TARGET_URL, TARGET_SERVICE_KEY);

const LOG = "migration-log.csv";
if (!existsSync(LOG)) {
  writeFileSync(LOG, "timestamp,bucket,path,size,status,error\n");
}
const log = (bucket: string, path: string, size: number, status: string, error = "") => {
  const line = `${new Date().toISOString()},${bucket},"${path}",${size},${status},"${error.replace(/"/g, "'")}"\n`;
  appendFileSync(LOG, line);
};

async function listAll(client: ReturnType<typeof createClient>, bucket: string, prefix = ""): Promise<{ path: string; size: number }[]> {
  const out: { path: string; size: number }[] = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await client.storage.from(bucket).list(prefix, { limit, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const item of data) {
      const full = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        // pasta — recursivo
        const children = await listAll(client, bucket, full);
        out.push(...children);
      } else {
        out.push({ path: full, size: (item.metadata as any)?.size ?? 0 });
      }
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return out;
}

async function ensureBucket(name: string, isPublic: boolean) {
  const { data: existing } = await target.storage.getBucket(name);
  if (existing) return;
  const { error } = await target.storage.createBucket(name, { public: isPublic });
  if (error && !error.message.includes("already exists")) {
    throw new Error(`Falha ao criar bucket ${name}: ${error.message}`);
  }
  console.log(`  📦 Bucket criado: ${name} (public=${isPublic})`);
}

async function migrateBucket(name: string) {
  console.log(`\n📁 Bucket: ${name}`);

  // Descobrir se é público na origem
  const { data: srcBucket } = await source.storage.getBucket(name);
  const isPublic = srcBucket?.public ?? false;

  await ensureBucket(name, isPublic);

  const files = await listAll(source, name);
  console.log(`   ${files.length} arquivos para migrar`);

  let ok = 0, skipped = 0, failed = 0;

  for (const [i, file] of files.entries()) {
    process.stdout.write(`\r   [${i + 1}/${files.length}] ${file.path.slice(0, 60).padEnd(60)}`);

    if (SKIP_EXISTING === "true") {
      const dir = file.path.includes("/") ? file.path.substring(0, file.path.lastIndexOf("/")) : "";
      const base = file.path.includes("/") ? file.path.substring(file.path.lastIndexOf("/") + 1) : file.path;
      const { data: existsList } = await target.storage.from(name).list(dir, { search: base, limit: 1 });
      if (existsList?.some(f => f.name === base)) {
        skipped++;
        log(name, file.path, file.size, "skipped");
        continue;
      }
    }

    try {
      const { data: blob, error: dlErr } = await source.storage.from(name).download(file.path);
      if (dlErr || !blob) throw new Error(dlErr?.message ?? "download null");

      const { error: upErr } = await target.storage.from(name).upload(file.path, blob, {
        upsert: true,
        contentType: blob.type || "application/octet-stream",
      });
      if (upErr) throw new Error(upErr.message);

      ok++;
      log(name, file.path, file.size, "ok");
    } catch (e: any) {
      failed++;
      log(name, file.path, file.size, "failed", e.message);
    }
  }

  console.log(`\n   ✅ ${ok} migrados | ⏭️  ${skipped} pulados | ❌ ${failed} falhas`);
}

async function main() {
  const list = BUCKETS
    ? BUCKETS.split(",").map(s => s.trim()).filter(Boolean)
    : (await source.storage.listBuckets()).data?.map(b => b.name) ?? [];

  console.log(`🚀 Migrando ${list.length} buckets: ${list.join(", ")}`);

  for (const bucket of list) {
    try {
      await migrateBucket(bucket);
    } catch (e: any) {
      console.error(`\n❌ Bucket ${bucket} falhou: ${e.message}`);
    }
  }

  console.log(`\n✅ Concluído. Log: ${LOG}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
