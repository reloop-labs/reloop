import { describe, expect, test } from "bun:test";
import {
	normalizeCsvEmails,
	skipReasonForContact,
} from "../src/lib/campaign/audience";
import { interpolate } from "../src/lib/campaign/interpolate";
import {
	canCancel,
	canDelete,
	canEdit,
	canSchedule,
	canSend,
} from "../src/lib/campaign/status";

describe("normalizeCsvEmails", () => {
	test("trims, lowercases, and drops duplicates and junk", () => {
		expect(
			normalizeCsvEmails([
				" Ada@Example.com ",
				"ada@example.com",
				"bob@example.com",
				"not-an-email",
				"",
			]),
		).toEqual(["ada@example.com", "bob@example.com"]);
	});
});

describe("skipReasonForContact", () => {
	test("allows subscribed contacts", () => {
		expect(
			skipReasonForContact({ status: "subscribed", suppressionReason: null }),
		).toBeNull();
	});

	test("skips unsubscribed, blocked, and suppressed contacts", () => {
		expect(skipReasonForContact({ status: "unsubscribed" })).toBe(
			"unsubscribed",
		);
		expect(skipReasonForContact({ status: "blocked" })).toBe("blocked");
		expect(
			skipReasonForContact({
				status: "subscribed",
				suppressionReason: "hard_bounce",
			}),
		).toBe("suppressed");
	});
});

describe("interpolate", () => {
	test("replaces simple and defaulted placeholders", () => {
		expect(
			interpolate('Hi {{firstName | default: "there"}}', { firstName: "Ada" }),
		).toBe("Hi Ada");
		expect(
			interpolate('Hi {{firstName | default: "there"}}', { firstName: "" }),
		).toBe("Hi there");
		expect(interpolate("{{{EMAIL}}}", { EMAIL: "ada@example.com" })).toBe(
			"ada@example.com",
		);
	});
});

describe("campaign status machine", () => {
	test("draft is editable, sendable, and deletable", () => {
		expect(canEdit("draft")).toBe(true);
		expect(canSend("draft")).toBe(true);
		expect(canSchedule("draft")).toBe(true);
		expect(canDelete("draft")).toBe(true);
		expect(canCancel("draft")).toBe(false);
	});

	test("sending can be cancelled but not edited", () => {
		expect(canEdit("sending")).toBe(false);
		expect(canCancel("sending")).toBe(true);
		expect(canDelete("sending")).toBe(false);
		expect(canSend("sent")).toBe(false);
	});
});
