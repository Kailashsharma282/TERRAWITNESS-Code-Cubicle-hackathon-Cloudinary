import fs from "fs";
import { execSync } from "child_process";

// Automatically parse .env or .env.production if present
for (const envFile of [".env.production", ".env", ".env.local"]) {
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const databaseUrl = process.env.DATABASE_URL || "";
const isPostgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

console.log("[TerraWitness] Preparing database schema...");
console.log(`[TerraWitness] DATABASE_URL protocol: ${isPostgres ? "PostgreSQL (Neon / Cloud)" : "SQLite (Local)"}`);

const targetSchemaPath = isPostgres
  ? "prisma/schema.postgresql.prisma"
  : "prisma/schema.sqlite.prisma";

if (fs.existsSync(targetSchemaPath)) {
  const targetContent = fs.readFileSync(targetSchemaPath, "utf-8");
  const currentContent = fs.existsSync("prisma/schema.prisma")
    ? fs.readFileSync("prisma/schema.prisma", "utf-8")
    : "";

  if (targetContent.trim() !== currentContent.trim()) {
    console.log(`[TerraWitness] Updating prisma/schema.prisma with ${targetSchemaPath}...`);
    fs.copyFileSync(targetSchemaPath, "prisma/schema.prisma");

    console.log("[TerraWitness] Generating Prisma Client...");
    const prismaCmd = (fs.existsSync("./node_modules/.bin/prisma") || fs.existsSync("./node_modules/prisma"))
      ? "npx --no-install prisma generate"
      : "npx prisma generate";
    try {
      execSync(prismaCmd, { stdio: "inherit" });
      console.log("[TerraWitness] Prisma Client generated successfully.");
    } catch (err) {
      console.warn("[TerraWitness] Notice: prisma generate encountered a warning or lock (common on Windows if dev server is running):", err.message);
    }
  } else {
    console.log("[TerraWitness] Schema already matches target environment. Checking Prisma client...");
    if (!fs.existsSync("node_modules/.prisma/client")) {
      console.log("[TerraWitness] Generating Prisma Client...");
      const prismaCmd = (fs.existsSync("./node_modules/.bin/prisma") || fs.existsSync("./node_modules/prisma"))
        ? "npx --no-install prisma generate"
        : "npx prisma generate";
      try {
        execSync(prismaCmd, { stdio: "inherit" });
      } catch (err) {
        console.warn("[TerraWitness] Prisma generate notice:", err.message);
      }
    } else {
      console.log("[TerraWitness] Prisma client is up to date.");
    }
  }
}

console.log("[TerraWitness] Database schema preparation complete.");
