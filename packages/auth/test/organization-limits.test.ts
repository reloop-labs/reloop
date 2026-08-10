import { describe, expect, test } from "bun:test";
import {
	ORGANIZATION_NAME_MAX_LENGTH,
	organizationNameMaxLengthMessage,
	organizationNameTooLong,
} from "../src/organization-limits";

describe("organization name limits", () => {
	test("allows names up to the max length", () => {
		expect(organizationNameTooLong("a".repeat(ORGANIZATION_NAME_MAX_LENGTH))).toBe(
			false,
		);
	});

	test("rejects names over the max length", () => {
		expect(
			organizationNameTooLong("a".repeat(ORGANIZATION_NAME_MAX_LENGTH + 1)),
		).toBe(true);
	});

	test("message includes the max length", () => {
		expect(organizationNameMaxLengthMessage()).toContain(
			String(ORGANIZATION_NAME_MAX_LENGTH),
		);
	});
});
