import { describe, expect, test } from "bun:test";
import { isRegistrationAllowed } from "@reloop/auth/registration-controls";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { isSetupBootstrapBypassed } from "@reloop/auth/setup/bootstrap-bypass";
import {
	type CompleteSetupDeps,
	type CompleteSetupInput,
	completeSelfHostSetup,
	InvalidAdminSetupKeyError,
	SetupNotAvailableError,
} from "@reloop/auth/setup/complete-setup";

const ADMIN_SETUP_KEY_FILE = "/run/reloop/admin-setup.key";
const ENV_FILE = "/run/reloop/.env";
const ADMIN_SETUP_KEY = "setup-key-value";

type RecordedCall = { name: string; payload?: unknown };

type Harness = {
	deps: CompleteSetupDeps;
	calls: RecordedCall[];
	names: () => string[];
	envUpdates: Record<string, string>[];
	bypassDuringSignUp: boolean[];
	registrationAllowedDuringSignUp: boolean[];
};

function createHarness(overrides: Partial<CompleteSetupDeps> = {}): Harness {
	const calls: RecordedCall[] = [];
	const envUpdates: Record<string, string>[] = [];
	const bypassDuringSignUp: boolean[] = [];
	const registrationAllowedDuringSignUp: boolean[] = [];

	const deps: CompleteSetupDeps = {
		adminSetupKeyFile: ADMIN_SETUP_KEY_FILE,
		envFile: ENV_FILE,
		getSetupStatus: async () => ({ required: true, reason: "ready" }),
		readAdminSetupKey: async (filePath) => {
			calls.push({ name: "readAdminSetupKey", payload: filePath });
			return ADMIN_SETUP_KEY;
		},
		signUpEmail: async (payload) => {
			calls.push({ name: "signUpEmail", payload });
			bypassDuringSignUp.push(isSetupBootstrapBypassed());
			registrationAllowedDuringSignUp.push(
				await isRegistrationAllowed(payload.email, "true", async () => false),
			);
			return { userId: "user-1" };
		},
		setUserRole: async (payload) => {
			calls.push({ name: "setUserRole", payload });
		},
		createOwnedOrganization: async (payload) => {
			calls.push({ name: "createOwnedOrganization", payload });
			return { organizationId: "org-1" };
		},
		setActiveOrganization: async (payload) => {
			calls.push({ name: "setActiveOrganization", payload });
		},
		setRuntimeDisableSignup: (value) => {
			calls.push({ name: "setRuntimeDisableSignup", payload: value });
		},
		patchEnvFile: async (filePath, updates) => {
			calls.push({ name: "patchEnvFile", payload: { filePath, updates } });
			envUpdates.push(updates);
		},
		consumeAdminSetupKeyFile: async (filePath) => {
			calls.push({ name: "consumeAdminSetupKeyFile", payload: filePath });
		},
		...overrides,
	};

	return {
		deps,
		calls,
		names: () => calls.map((call) => call.name),
		envUpdates,
		bypassDuringSignUp,
		registrationAllowedDuringSignUp,
	};
}

function createInput(overrides: Partial<CompleteSetupInput> = {}) {
	return {
		adminKey: ADMIN_SETUP_KEY,
		name: "Ada Lovelace",
		email: "admin@example.com",
		password: "correct-horse-battery-staple",
		disableSignup: true,
		organizationName: "Reloop Labs",
		appName: "Reloop",
		...overrides,
	} satisfies CompleteSetupInput;
}

describe("completeSelfHostSetup", () => {
	test("creates the super-admin, the organization, and closes setup", async () => {
		const harness = createHarness();

		const result = await completeSelfHostSetup(createInput(), harness.deps);

		expect(result).toEqual({ userId: "user-1", organizationId: "org-1" });
		expect(harness.names()).toEqual([
			"readAdminSetupKey",
			"signUpEmail",
			"setUserRole",
			"createOwnedOrganization",
			"setActiveOrganization",
			"setRuntimeDisableSignup",
			"patchEnvFile",
			"consumeAdminSetupKeyFile",
		]);
		expect(harness.calls[1]?.payload).toEqual({
			name: "Ada Lovelace",
			email: "admin@example.com",
			password: "correct-horse-battery-staple",
		});
		expect(harness.calls[2]?.payload).toEqual({
			userId: "user-1",
			role: PLATFORM_ADMIN_ROLE,
		});
		expect(harness.calls[3]?.payload).toEqual({
			userId: "user-1",
			name: "Reloop Labs",
		});
		expect(harness.calls[4]?.payload).toEqual({
			userId: "user-1",
			organizationId: "org-1",
		});
		expect(harness.calls[5]?.payload).toBe(true);
		expect(harness.envUpdates).toEqual([
			{ SETUP_MODE: "false", DISABLE_SIGNUP: "true", APP_NAME: "Reloop" },
		]);
		expect(harness.calls[6]?.payload).toEqual({
			filePath: ENV_FILE,
			updates: {
				SETUP_MODE: "false",
				DISABLE_SIGNUP: "true",
				APP_NAME: "Reloop",
			},
		});
		expect(harness.calls[7]?.payload).toBe(ADMIN_SETUP_KEY_FILE);
	});

	test("creates the super-admin behind a scoped registration bypass", async () => {
		const harness = createHarness();

		await completeSelfHostSetup(createInput(), harness.deps);

		expect(harness.bypassDuringSignUp).toEqual([true]);
		expect(harness.registrationAllowedDuringSignUp).toEqual([true]);
		expect(isSetupBootstrapBypassed()).toBe(false);
		expect(
			await isRegistrationAllowed(
				"admin@example.com",
				"true",
				async () => false,
			),
		).toBe(false);
	});

	test("releases the bypass when user creation fails", async () => {
		const harness = createHarness({
			signUpEmail: async () => {
				throw new Error("weak password");
			},
		});

		await expect(
			completeSelfHostSetup(createInput(), harness.deps),
		).rejects.toThrow("weak password");
		expect(isSetupBootstrapBypassed()).toBe(false);
	});

	test("skips the organization when no name is given", async () => {
		const harness = createHarness();

		const result = await completeSelfHostSetup(
			createInput({ organizationName: undefined }),
			harness.deps,
		);

		expect(result).toEqual({ userId: "user-1", organizationId: null });
		expect(harness.names()).not.toContain("createOwnedOrganization");
		expect(harness.names()).not.toContain("setActiveOrganization");
	});

	test("treats a blank organization name as no organization", async () => {
		const harness = createHarness();

		const result = await completeSelfHostSetup(
			createInput({ organizationName: "   " }),
			harness.deps,
		);

		expect(result.organizationId).toBeNull();
		expect(harness.names()).not.toContain("createOwnedOrganization");
	});

	test("keeps signup open when the operator did not lock it", async () => {
		const harness = createHarness();

		await completeSelfHostSetup(
			createInput({ disableSignup: false, appName: undefined }),
			harness.deps,
		);

		expect(harness.names()).not.toContain("setRuntimeDisableSignup");
		expect(harness.envUpdates).toEqual([{ SETUP_MODE: "false" }]);
	});

	test("refuses when setup is already complete", async () => {
		const harness = createHarness({
			getSetupStatus: async () => ({
				required: false,
				reason: "already_complete",
			}),
		});

		const error = await completeSelfHostSetup(
			createInput(),
			harness.deps,
		).catch((thrown: unknown) => thrown);

		expect(error).toBeInstanceOf(SetupNotAvailableError);
		expect((error as SetupNotAvailableError).name).toBe("SetupNotAvailable");
		expect((error as SetupNotAvailableError).reason).toBe("already_complete");
		expect(harness.names()).toEqual([]);
	});

	test("refuses outside self-host setup mode", async () => {
		const harness = createHarness({
			getSetupStatus: async () => ({
				required: false,
				reason: "not_self_host_setup",
			}),
		});

		const error = await completeSelfHostSetup(
			createInput(),
			harness.deps,
		).catch((thrown: unknown) => thrown);

		expect((error as SetupNotAvailableError).reason).toBe(
			"not_self_host_setup",
		);
		expect(harness.names()).toEqual([]);
	});

	test("refuses when the key file disappeared before completion", async () => {
		const harness = createHarness({
			readAdminSetupKey: async () => null,
		});

		const error = await completeSelfHostSetup(
			createInput(),
			harness.deps,
		).catch((thrown: unknown) => thrown);

		expect(error).toBeInstanceOf(SetupNotAvailableError);
		expect((error as SetupNotAvailableError).reason).toBe("missing_key");
		expect(harness.names()).toEqual([]);
	});

	test("refuses a wrong admin key without touching the instance", async () => {
		const harness = createHarness();

		const error = await completeSelfHostSetup(
			createInput({ adminKey: "setup-key-wrong" }),
			harness.deps,
		).catch((thrown: unknown) => thrown);

		expect(error).toBeInstanceOf(InvalidAdminSetupKeyError);
		expect((error as InvalidAdminSetupKeyError).name).toBe(
			"InvalidAdminSetupKey",
		);
		expect(harness.names()).toEqual(["readAdminSetupKey"]);
	});

	test("refuses an empty admin key", async () => {
		const harness = createHarness();

		const error = await completeSelfHostSetup(
			createInput({ adminKey: "" }),
			harness.deps,
		).catch((thrown: unknown) => thrown);

		expect(error).toBeInstanceOf(InvalidAdminSetupKeyError);
		expect(harness.names()).toEqual(["readAdminSetupKey"]);
	});
});
