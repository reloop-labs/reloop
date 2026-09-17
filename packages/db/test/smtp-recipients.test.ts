import { describe, expect, test } from "bun:test";
import { uniqueBareEmails } from "../src/smtp-recipients";

describe("uniqueBareEmails", () => {
	test("counts three envelope addresses as three recipients", () => {
		expect(
			uniqueBareEmails(["a@example.com", "b@example.com", "c@example.com"]),
		).toEqual(["a@example.com", "b@example.com", "c@example.com"]);
	});

	test("splits a comma-separated To header instead of counting it as one", () => {
		expect(
			uniqueBareEmails(["Alice <a@example.com>, b@example.com, c@example.com"]),
		).toEqual(["a@example.com", "b@example.com", "c@example.com"]);
	});

	test("an empty list does not invent a recipient", () => {
		expect(uniqueBareEmails([])).toEqual([]);
		expect(uniqueBareEmails(["not-an-email", "   "])).toEqual([]);
	});

	test("deduplicates mixed header and envelope forms", () => {
		expect(
			uniqueBareEmails(["A <a@example.com>", "a@example.com", "B <b@x.io>"]),
		).toEqual(["a@example.com", "b@x.io"]);
	});
});
