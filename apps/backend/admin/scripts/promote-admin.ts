#!/usr/bin/env bun
/**
 * Bootstrap a platform super-admin user by email.
 *
 * Usage:
 *   bun run apps/backend/admin/scripts/promote-admin.ts you@example.com
 */
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
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

await db
	.update(user)
	.set({ role: PLATFORM_ADMIN_ROLE })
	.where(eq(user.id, existing.id));

console.log(`Promoted ${email} (${existing.id}) to platform ${PLATFORM_ADMIN_ROLE}.`);
process.exit(0);
