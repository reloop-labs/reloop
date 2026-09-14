import { describe, expect, test } from "bun:test";
import {
	isEnvFlagEnabled,
	isRegistrationAllowed,
	REGISTRATION_DISABLED_MESSAGE,
} from "@reloop/auth/registration-controls";

describe("isEnvFlagEnabled", () => {
	test("enables on true regardless of case or padding", () => {
		for (const value of ["true", "TRUE", "True", " true ", "\ttrue\n"]) {
			expect(isEnvFlagEnabled(value)).toBe(true);
		}
	});

	test("stays disabled for anything else", () => {
		for (const value of [
			undefined,
			"",
			"false",
			"FALSE",
			"0",
			"1",
			"yes",
			"no",
		]) {
			expect(isEnvFlagEnabled(value)).toBe(false);
		}
	});
});

describe("registration refusal message", () => {
	test("does not reveal whether the address is already registered", () => {
		expect(REGISTRATION_DISABLED_MESSAGE.length).toBeGreaterThan(0);
		expect(REGISTRATION_DISABLED_MESSAGE.toLowerCase()).not.toContain(
			"already",
		);
		expect(REGISTRATION_DISABLED_MESSAGE.toLowerCase()).not.toContain("exists");
	});
});

describe("closed registration still honours invitations", () => {
	const PENDING = new Set(["alice@example.com"]);
	const lookup = async (email: string) => PENDING.has(email);

	test("an invited address may still sign up", async () => {
		expect(
			await isRegistrationAllowed("alice@example.com", "true", lookup),
		).toBe(true);
	});

	test("the invite is matched after normalization", async () => {
		expect(
			await isRegistrationAllowed("  Alice@Example.COM  ", "true", lookup),
		).toBe(true);
	});

	test("an uninvited address is refused", async () => {
		expect(await isRegistrationAllowed("bob@example.com", "true", lookup)).toBe(
			false,
		);
	});

	test("a missing address is refused without a lookup", async () => {
		let called = false;
		const spy = async (email: string) => {
			called = true;
			return lookup(email);
		};

		expect(await isRegistrationAllowed(undefined, "true", spy)).toBe(false);
		expect(await isRegistrationAllowed("   ", "true", spy)).toBe(false);
		expect(called).toBe(false);
	});

	test("open registration admits everyone without a lookup", async () => {
		let called = false;
		const spy = async (email: string) => {
			called = true;
			return lookup(email);
		};

		expect(await isRegistrationAllowed("bob@example.com", "false", spy)).toBe(
			true,
		);
		expect(await isRegistrationAllowed("bob@example.com", undefined, spy)).toBe(
			true,
		);
		expect(called).toBe(false);
	});
});
