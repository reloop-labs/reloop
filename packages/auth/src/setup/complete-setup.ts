import { PLATFORM_ADMIN_ROLE } from "../roles";
import { runWithSetupBootstrapBypass } from "./bootstrap-bypass";
import { adminSetupKeysEqual } from "./setup-mode";
import type { SetupStatus } from "./setup-status";

export type CompleteSetupInput = {
	adminKey: string;
	name: string;
	email: string;
	password: string;
	disableSignup: boolean;
	organizationName?: string;
	appName?: string;
};

export type CompleteSetupResult = {
	userId: string;
	organizationId: string | null;
};

export type CompleteSetupDeps = {
	adminSetupKeyFile: string;
	envFile: string;
	getSetupStatus: () => Promise<SetupStatus>;
	readAdminSetupKey: (filePath: string) => Promise<string | null>;
	signUpEmail: (input: {
		name: string;
		email: string;
		password: string;
	}) => Promise<{ userId: string }>;
	setUserRole: (input: { userId: string; role: string }) => Promise<void>;
	deleteUser?: (input: { userId: string }) => Promise<void>;
	createOwnedOrganization: (input: {
		userId: string;
		name: string;
	}) => Promise<{ organizationId: string }>;
	setActiveOrganization: (input: {
		userId: string;
		organizationId: string;
	}) => Promise<void>;
	setRuntimeDisableSignup: (value: boolean) => void;
	patchEnvFile: (
		filePath: string,
		updates: Record<string, string>,
	) => Promise<void>;
	consumeAdminSetupKeyFile: (filePath: string) => Promise<void>;
};

export class SetupNotAvailableError extends Error {
	readonly reason: SetupStatus["reason"];

	constructor(reason: SetupStatus["reason"]) {
		super("Self-host setup is not available");
		this.name = "SetupNotAvailable";
		this.reason = reason;
	}
}

export class InvalidAdminSetupKeyError extends Error {
	constructor() {
		super("Invalid setup key");
		this.name = "InvalidAdminSetupKey";
	}
}

export class AdminPromotionFailedError extends Error {
	readonly rolledBack: boolean;

	constructor(rolledBack: boolean, cause: unknown) {
		super(
			rolledBack
				? "The administrator account could not be promoted, so it was removed. Try setup again."
				: "The administrator account was created but could not be promoted. Run apps/backend/admin/scripts/promote-admin.ts for that email, then sign in.",
			{ cause },
		);
		this.name = "AdminPromotionFailed";
		this.rolledBack = rolledBack;
	}
}

export class SetupFinalizationFailedError extends Error {
	readonly rolledBack: boolean;
	readonly envClosed: boolean;

	constructor(
		rolledBack: boolean,
		cause: unknown,
		options: { envClosed?: boolean } = {},
	) {
		const envClosed = options.envClosed === true;
		super(
			envClosed
				? "Setup closed the instance but could not clear the admin setup key. Sign in with the administrator account you just created."
				: rolledBack
					? "Setup could not finish after creating the administrator, so the account was removed. Try setup again."
					: "Setup could not finish after creating the administrator. Remove that account (or run apps/backend/admin/scripts/promote-admin.ts if it is incomplete), then try setup again.",
			{ cause },
		);
		this.name = "SetupFinalizationFailed";
		this.rolledBack = rolledBack;
		this.envClosed = envClosed;
	}
}

export async function completeSelfHostSetup(
	input: CompleteSetupInput,
	deps: CompleteSetupDeps,
): Promise<CompleteSetupResult> {
	const status = await deps.getSetupStatus();
	if (!status.required) throw new SetupNotAvailableError(status.reason);

	const expectedKey = await deps.readAdminSetupKey(deps.adminSetupKeyFile);
	if (!expectedKey) throw new SetupNotAvailableError("missing_key");
	if (!adminSetupKeysEqual(input.adminKey, expectedKey)) {
		throw new InvalidAdminSetupKeyError();
	}

	const { userId } = await runWithSetupBootstrapBypass(() =>
		deps.signUpEmail({
			name: input.name,
			email: input.email,
			password: input.password,
		}),
	);
	try {
		await deps.setUserRole({ userId, role: PLATFORM_ADMIN_ROLE });
	} catch (error) {
		let rolledBack = false;
		if (deps.deleteUser) {
			try {
				await deps.deleteUser({ userId });
				rolledBack = true;
			} catch {
				rolledBack = false;
			}
		}
		throw new AdminPromotionFailedError(rolledBack, error);
	}

	const organizationName = input.organizationName?.trim();
	let organizationId: string | null = null;
	let closedSignup = false;
	let envClosed = false;
	try {
		if (organizationName) {
			const organization = await deps.createOwnedOrganization({
				userId,
				name: organizationName,
			});
			organizationId = organization.organizationId;
			await deps.setActiveOrganization({ userId, organizationId });
		}

		if (input.disableSignup) {
			deps.setRuntimeDisableSignup(true);
			closedSignup = true;
		}

		const appName = input.appName?.trim();
		await deps.patchEnvFile(deps.envFile, {
			SETUP_MODE: "false",
			...(input.disableSignup ? { DISABLE_SIGNUP: "true" } : {}),
			...(appName ? { APP_NAME: appName } : {}),
		});
		envClosed = true;

		await deps.consumeAdminSetupKeyFile(deps.adminSetupKeyFile);

		return { userId, organizationId };
	} catch (error) {
		if (closedSignup) deps.setRuntimeDisableSignup(false);

		if (envClosed) {
			throw new SetupFinalizationFailedError(false, error, { envClosed: true });
		}

		let rolledBack = false;
		if (deps.deleteUser) {
			try {
				await deps.deleteUser({ userId });
				rolledBack = true;
			} catch {
				rolledBack = false;
			}
		}
		throw new SetupFinalizationFailedError(rolledBack, error);
	}
}
