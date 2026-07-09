#!/usr/bin/env bun
/**
 * Bootstrap a platform admin user by email.
 *
 * Usage:
 *   bun run apps/backend/admin/scripts/promote-admin.ts you@example.com
 */
import { db } from "@reloop/db/client";
import { user } from "@reloop/db/schema";
import { eq } from "drizzle-orm";

const email = process.argv[2];

if (!email) {
	console.error("Usage: bun run apps/backend/admin/scripts/promote-admin.ts <email>");
	process.exit(1);
}

const existing = await db.query.user.findFirst({
	where: eq(user.email, email),
});

if (!existing) {
	console.error(`No user found with email: ${email}`);
	process.exit(1);
}

await db.update(user).set({ role: "admin" }).where(eq(user.id, existing.id));

console.log(`Promoted ${email} (${existing.id}) to platform admin.`);
process.exit(0);
