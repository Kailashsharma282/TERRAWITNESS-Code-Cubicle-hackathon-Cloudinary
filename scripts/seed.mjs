import { seedDemoData } from "../src/lib/demo/seed-data.ts";

async function main() {
  console.log("Seeding TerraWitness demo data...");
  const result = await seedDemoData();
  console.log("Result:", result);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
