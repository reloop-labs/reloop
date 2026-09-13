import { describe, expect, test } from "bun:test";
import {
	isEnvFlagEnabled,
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
