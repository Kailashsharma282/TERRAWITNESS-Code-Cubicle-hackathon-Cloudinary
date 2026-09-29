import { execSync } from "child_process";
import fs from "fs";

console.log("==================================================");
console.log("   TERRAWITNESS CONTAINER INITIALIZATION RUNNER   ");
console.log("==================================================");

const databaseUrl = process.env.DATABASE_URL || "";
const isPostgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

console.log(`[INIT] Detected Database Protocol: ${isPostgres ? "PostgreSQL" : "SQLite / Local"}`);

if (isPostgres) {
  if (fs.existsSync("prisma/schema.postgresql.prisma")) {
    console.log("[INIT] Applying PostgreSQL Prisma schema definition...");
    fs.copyFileSync("prisma/schema.postgresql.prisma", "prisma/schema.prisma");
  }
}

console.log("[INIT] Generating Prisma Client bindings...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (err) {
  console.error("[INIT] Failed to generate prisma client:", err.message);
}

if (process.env.APPLY_MIGRATIONS === "true" || process.env.NODE_ENV === "production") {
  console.log("[INIT] Synchronizing database tables (db push)...");
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  } catch (err) {
    console.warn("[INIT] Notice: Database push encountered warning:", err.message);
  }
}

if (process.env.ENABLE_DEMO_SEED === "true") {
  console.log("[INIT] Verifying demo dataset...");
  try {
    execSync("node scripts/seed.mjs", { stdio: "inherit" });
  } catch (err) {
    console.warn("[INIT] Demo seed notice:", err.message);
  }
}

console.log("[INIT] Launching TerraWitness production Next.js instance on port " + (process.env.PORT || 3000));
execSync("node_modules/.bin/next start -p " + (process.env.PORT || 3000) + " -H " + (process.env.HOSTNAME || "0.0.0.0"), {
  stdio: "inherit",
});
