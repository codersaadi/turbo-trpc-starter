import { seedDefaultAdmin } from "./default-admin";

/**
 * Main seed function - runs all seeders
 */
async function seed() {
  console.log("🌱 Starting database seeding...\n");

  // Seed default admin
  await seedDefaultAdmin();

  console.log("\n✅ All seeds completed!");
}

// Run if called directly
if (require.main === module || process.argv[1]?.includes("seed/index")) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seed, seedDefaultAdmin };
