import { afterEach, describe, expect, test } from "bun:test";
import { isSelfHosted } from "../src/self-hosted";

const original = process.env.SELF_HOSTED;

afterEach(() => {
	if (original === undefined) delete process.env.SELF_HOSTED;
	else process.env.SELF_HOSTED = original;
});

describe("isSelfHosted", () => {
	test("is off when unset, so Cloud limits apply by default", () => {
		delete process.env.SELF_HOSTED;
		expect(isSelfHosted()).toBe(false);
	});

	test("is off for false and empty values", () => {
		process.env.SELF_HOSTED = "false";
		expect(isSelfHosted()).toBe(false);
		process.env.SELF_HOSTED = "";
		expect(isSelfHosted()).toBe(false);
	});

	test("is on for true and 1", () => {
		process.env.SELF_HOSTED = "true";
		expect(isSelfHosted()).toBe(true);
		process.env.SELF_HOSTED = "1";
		expect(isSelfHosted()).toBe(true);
	});
});
