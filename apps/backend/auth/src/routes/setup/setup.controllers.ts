import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { authServerConfig } from "@reloop/auth/server/config";
import {
	type CompleteSetupDeps,
	type CompleteSetupInput,
	completeSelfHostSetup,
} from "@reloop/auth/setup/complete-setup";
import { setRuntimeDisableSignup } from "@reloop/auth/setup/runtime-registration";
import {
	consumeAdminSetupKeyFile,
	patchEnvFile,
	readAdminSetupKey,
} from "@reloop/auth/setup/setup-mode";
import {
	getSetupStatus,
	type SetupStatus,
} from "@reloop/auth/setup/setup-status";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../../lib/auth";

export type CompleteSetupHttpResult = {
	user: {
		id: string;
		name: string;
		email: string;
		role: typeof PLATFORM_ADMIN_ROLE;
	};
	organizationId: string | null;
	setCookies: string[];
};

function toSlug(name: string): string {
	const slug = name
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48);
	return slug || "organization";
}

async function uniqueOrganizationSlug(name: string): Promise<string> {
	const slug = toSlug(name);
	const [taken] = await db
		.select({ id: schema.organization.id })
		.from(schema.organization)
		.where(eq(schema.organization.slug, slug))
		.limit(1);

	return taken ? `${slug}-${crypto.randomUUID().slice(0, 8)}` : slug;
}

const setupDeps: CompleteSetupDeps = {
	adminSetupKeyFile: authServerConfig.ADMIN_SETUP_KEY_FILE,
	envFile: authServerConfig.RELOOP_ENV_FILE,
	getSetupStatus,
	readAdminSetupKey,
	signUpEmail: async ({ name, email, password }) => {
		const created = await auth.api.signUpEmail({
			body: { name, email, password },
		});
		return { userId: created.user.id };
	},
	setUserRole: async ({ userId, role }) => {
		await db
			.update(schema.user)
			.set({ role: role as typeof PLATFORM_ADMIN_ROLE })
			.where(eq(schema.user.id, userId));
	},
	deleteUser: async ({ userId }) => {
		await db.delete(schema.user).where(eq(schema.user.id, userId));
	},
	createOwnedOrganization: async ({ userId, name }) => {
		const created = await auth.api.createOrganization({
			body: { name, slug: await uniqueOrganizationSlug(name), userId },
		});
		if (!created) throw new Error("Setup organization was not created");
		return { organizationId: created.id };
	},
	setActiveOrganization: async ({ userId, organizationId }) => {
		await db
			.update(schema.user)
			.set({ activeOrganizationId: organizationId })
			.where(eq(schema.user.id, userId));
	},
	setRuntimeDisableSignup,
	patchEnvFile,
	consumeAdminSetupKeyFile,
};

export async function setupStatusController(): Promise<SetupStatus> {
	return await getSetupStatus();
}

export async function completeSetupController(
	input: CompleteSetupInput,
): Promise<CompleteSetupHttpResult> {
	const { userId, organizationId } = await completeSelfHostSetup(
		input,
		setupDeps,
	);

	const { headers } = await auth.api.signInEmail({
		body: { email: input.email, password: input.password },
		returnHeaders: true,
	});

	return {
		user: {
			id: userId,
			name: input.name,
			email: input.email,
			role: PLATFORM_ADMIN_ROLE,
		},
		organizationId,
		setCookies: headers.getSetCookie(),
	};
}
