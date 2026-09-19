import { describe, expect, test } from "bun:test";
import { resolveSetupStatus } from "@reloop/auth/setup/setup-status";

describe("resolveSetupStatus", () => {
	test("does not require setup outside self-host setup mode", async () => {
		expect(
			await resolveSetupStatus({
				setupMode: "false",
				userCount: 0,
				superAdminCount: 0,
				keyPresent: true,
			}),
		).toEqual({ required: false, reason: "not_self_host_setup" });
	});

	test("does not require setup when a user exists", async () => {
		expect(
			await resolveSetupStatus({
				setupMode: "true",
				userCount: 1,
				superAdminCount: 0,
				keyPresent: true,
			}),
		).toEqual({ required: false, reason: "already_complete" });
	});

	test("does not require setup when a super-admin exists", async () => {
		expect(
			await resolveSetupStatus({
				setupMode: "true",
				userCount: 0,
				superAdminCount: 1,
				keyPresent: true,
			}),
		).toEqual({ required: false, reason: "already_complete" });
	});

	test("does not require setup when the key is missing", async () => {
		expect(
			await resolveSetupStatus({
				setupMode: "true",
				userCount: 0,
				superAdminCount: 0,
				keyPresent: false,
			}),
		).toEqual({ required: false, reason: "missing_key" });
	});

	test("requires setup when the wizard is ready", async () => {
		expect(
			await resolveSetupStatus({
				setupMode: "true",
				userCount: 0,
				superAdminCount: 0,
				keyPresent: true,
			}),
		).toEqual({ required: true, reason: "ready" });
	});
});
