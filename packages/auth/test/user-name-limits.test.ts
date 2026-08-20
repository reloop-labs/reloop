import { describe, expect, test } from "bun:test";
import {
	USER_NAME_PART_MAX_LENGTH,
	userDisplayNamePartsTooLong,
	userNamePartMaxLengthMessage,
	userNamePartTooLong,
} from "../src/user-name-limits";

describe("user name limits", () => {
	test("allows parts up to the max length", () => {
		expect(userNamePartTooLong("a".repeat(USER_NAME_PART_MAX_LENGTH))).toBe(
			false,
		);
	});

	test("rejects parts over the max length", () => {
		expect(userNamePartTooLong("a".repeat(USER_NAME_PART_MAX_LENGTH + 1))).toBe(
			true,
		);
	});

	test("validates combined display name parts", () => {
		const okFirst = "a".repeat(USER_NAME_PART_MAX_LENGTH);
		const okLast = "b".repeat(USER_NAME_PART_MAX_LENGTH);
		expect(userDisplayNamePartsTooLong(`${okFirst} ${okLast}`)).toBe(false);
		expect(
			userDisplayNamePartsTooLong(
				`${"a".repeat(USER_NAME_PART_MAX_LENGTH + 1)} Doe`,
			),
		).toBe(true);
		expect(
			userDisplayNamePartsTooLong(
				`Jane ${"b".repeat(USER_NAME_PART_MAX_LENGTH + 1)}`,
			),
		).toBe(true);
	});

	test("message includes the part label and max length", () => {
		expect(userNamePartMaxLengthMessage("First name")).toContain("First name");
		expect(userNamePartMaxLengthMessage("First name")).toContain(
			String(USER_NAME_PART_MAX_LENGTH),
		);
	});
});
