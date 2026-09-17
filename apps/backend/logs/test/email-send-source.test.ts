import { describe, expect, test } from "bun:test";
import { isEmailSendSource, sourceFromTags, tagValue } from "@reloop/db";

describe("sourceFromTags", () => {
	test("campaign tag wins", () => {
		expect(sourceFromTags([{ name: "campaign", value: "cmp_1" }])).toBe(
			"campaign",
		);
	});

	test("automation tag maps to automation", () => {
		expect(sourceFromTags([{ name: "automation", value: "auto_1" }])).toBe(
			"automation",
		);
	});

	test("untagged API sends are transactional", () => {
		expect(sourceFromTags([])).toBe("transactional");
		expect(sourceFromTags(null)).toBe("transactional");
		expect(sourceFromTags([{ name: "env", value: "prod" }])).toBe(
			"transactional",
		);
	});
});

describe("tagValue / isEmailSendSource", () => {
	test("reads a tag case-insensitively", () => {
		expect(tagValue([{ name: "Campaign", value: "cmp_9" }], "campaign")).toBe(
			"cmp_9",
		);
	});

	test("accepts known sources only", () => {
		expect(isEmailSendSource("campaign")).toBe(true);
		expect(isEmailSendSource("smtp")).toBe(true);
		expect(isEmailSendSource("broadcast")).toBe(false);
	});
});
