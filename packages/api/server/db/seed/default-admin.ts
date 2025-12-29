import { serverDB } from "../server";
import { users, accounts } from "../schema/better-auth";
import { hashPassword } from "../../auth/hash";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

/**
 * Default admin credentials
 * IMPORTANT: Change these in production!
 */
const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || "admin@example.com",
  password: process.env.ADMIN_PASSWORD || "admin123456",
  name: process.env.ADMIN_NAME || "Admin",
};

async function seedDefaultAdmin() {
  console.log("🌱 Seeding default admin user...");

  try {
    // Check if admin already exists
    const existingAdmin = await serverDB.query.users.findFirst({
      where: eq(users.email, DEFAULT_ADMIN.email),
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${DEFAULT_ADMIN.email}`);
      console.log("   Skipping admin creation.");
      return existingAdmin;
    }

    // Hash the password
    const hashedPassword = await hashPassword(DEFAULT_ADMIN.password);

    // Create admin user
    const userId = createId();
    const [newUser] = await serverDB
      .insert(users)
      .values({
        id: userId,
        email: DEFAULT_ADMIN.email,
        name: DEFAULT_ADMIN.name,
        emailVerified: true,
        role: "admin",
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create account entry with password
    await serverDB.insert(accounts).values({
      id: createId(),
      userId: userId,
      accountId: DEFAULT_ADMIN.email,
      providerId: "credential",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Default admin user created successfully!");
    console.log(`   Email: ${DEFAULT_ADMIN.email}`);
    console.log(`   Password: ${DEFAULT_ADMIN.password}`);
    console.log("");
    console.log(
      "⚠️  IMPORTANT: Change the default password after first login!",
    );

    return newUser;
  } catch (error) {
    console.error("❌ Failed to seed admin user:", error);
    throw error;
  }
}

// Run if called directly
const isMainModule =
  require.main === module || process.argv[1]?.includes("default-admin");

if (isMainModule) {
  seedDefaultAdmin()
    .then(() => {
      console.log("🎉 Seed completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

export { seedDefaultAdmin, DEFAULT_ADMIN };
