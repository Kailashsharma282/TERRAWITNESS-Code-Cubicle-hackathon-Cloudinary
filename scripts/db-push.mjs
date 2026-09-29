import { execSync } from "child_process";

console.log("[TerraWitness] Synchronizing database tables with Prisma...");
try {
  execSync("node scripts/prepare-prisma.mjs", { stdio: "inherit" });
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  console.log("[TerraWitness] Database schema synchronized successfully.");

  if (process.env.ENABLE_DEMO_SEED === "true") {
    console.log("[TerraWitness] ENABLE_DEMO_SEED=true detected. Seeding initial projects...");
    execSync("npx tsx scripts/seed.mjs", { stdio: "inherit" });
  }
} catch (err) {
  console.error("[TerraWitness] Database synchronization failed:", err.message);
  process.exit(1);
}
