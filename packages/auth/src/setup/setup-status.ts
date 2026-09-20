import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { PLATFORM_ADMIN_ROLE } from "../roles";
import { authServerConfig } from "../server/config";
import { isSetupModeEnabled, readAdminSetupKey } from "./setup-mode";

export type SetupStatus = {
	required: boolean;
	reason: "not_self_host_setup" | "already_complete" | "missing_key" | "ready";
};

export async function resolveSetupStatus(input: {
	setupMode: string | undefined;
	userCount: number;
	superAdminCount: number;
	keyPresent: boolean;
}): Promise<SetupStatus> {
	if (!isSetupModeEnabled(input.setupMode)) {
		return { required: false, reason: "not_self_host_setup" };
	}
	if (input.userCount > 0 || input.superAdminCount > 0) {
		return { required: false, reason: "already_complete" };
	}
	if (!input.keyPresent) {
		return { required: false, reason: "missing_key" };
	}
	return { required: true, reason: "ready" };
}

export async function getSetupStatus(): Promise<SetupStatus> {
	const setupMode = authServerConfig.SETUP_MODE;
	if (!isSetupModeEnabled(setupMode)) {
		return await resolveSetupStatus({
			setupMode,
			userCount: 0,
			superAdminCount: 0,
			keyPresent: false,
		});
	}

	const [users, superAdmins] = await Promise.all([
		db.select({ id: schema.user.id }).from(schema.user).limit(1),
		db
			.select({ id: schema.user.id })
			.from(schema.user)
			.where(eq(schema.user.role, PLATFORM_ADMIN_ROLE))
			.limit(1),
	]);
	if (users.length > 0 || superAdmins.length > 0) {
		return { required: false, reason: "already_complete" };
	}
	const key = await readAdminSetupKey(authServerConfig.ADMIN_SETUP_KEY_FILE);

	return await resolveSetupStatus({
		setupMode,
		userCount: users.length,
		superAdminCount: superAdmins.length,
		keyPresent: Boolean(key),
	});
}
