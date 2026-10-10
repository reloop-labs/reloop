import { describe, expect, test } from "vitest";
import {
	normalizeUserCode,
	verificationResources,
	verificationScopes,
} from "./device-request";

describe("normalizeUserCode", () => {
	test("uppercases and strips readability punctuation", () => {
		expect(normalizeUserCode("abcd-1234")).toBe("ABCD1234");
		expect(normalizeUserCode("  ab cd 12 34 ")).toBe("ABCD1234");
		expect(normalizeUserCode("ABCD1234")).toBe("ABCD1234");
		expect(normalizeUserCode("")).toBe("");
	});
});

describe("verificationResources", () => {
	test("handles missing, single, and multiple resources", () => {
		expect(
			verificationResources({ user_code: "X", status: "pending" }),
		).toEqual([]);
		expect(
			verificationResources({
				user_code: "X",
				status: "pending",
				resource: "https://api.example.com",
			}),
		).toEqual(["https://api.example.com"]);
		expect(
			verificationResources({
				user_code: "X",
				status: "pending",
				resource: ["https://a.example", "https://b.example"],
			}),
		).toEqual(["https://a.example", "https://b.example"]);
	});
});

describe("verificationScopes", () => {
	test("splits scope strings and tolerates absence", () => {
		expect(
			verificationScopes({
				user_code: "X",
				status: "pending",
				scope: "openid profile",
			}),
		).toEqual(["openid", "profile"]);
		expect(verificationScopes({ user_code: "X", status: "pending" })).toEqual(
			[],
		);
	});
});
