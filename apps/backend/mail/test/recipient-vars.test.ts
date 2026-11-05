import { describe, expect, test } from "bun:test";
import {
	listUnsubscribeHeaders,
	mailtoUnsubscribeUrl,
} from "@reloop/db/unsubscribe";
import {
	mergeMissingHeaders,
	usesRecipientVars,
} from "../src/lib/recipient-vars";

describe("usesRecipientVars", () => {
	test("detects the editor's lowercase unsubscribe placeholder", () => {
		expect(
			usesRecipientVars(['<a href="{{{unsubscribe_url}}}">Unsubscribe</a>']),
		).toBe(true);
	});

	test("detects reserved contact fields with inner whitespace", () => {
		expect(usesRecipientVars([undefined, "Hi {{{ FIRST_NAME }}}"])).toBe(true);
	});

	test("ignores custom variables and double braces", () => {
		expect(usesRecipientVars(["{{{company}}} {{FIRST_NAME}}", null])).toBe(
			false,
		);
	});
});

describe("mergeMissingHeaders", () => {
	const unsubscribe = {
		"List-Unsubscribe": "<https://x/one-click/t>",
		"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
	};

	test("adds List-Unsubscribe when the caller set none", () => {
		expect(mergeMissingHeaders({ "X-Tag": "a" }, unsubscribe)).toEqual({
			"X-Tag": "a",
			...unsubscribe,
		});
	});

	test("keeps the caller's own List-Unsubscribe pair untouched", () => {
		const own = { "list-unsubscribe": "<mailto:me@acme.com>" };
		expect(mergeMissingHeaders(own, unsubscribe)).toBe(own);
	});

	test("leaves headers alone when there is nothing to add", () => {
		expect(mergeMissingHeaders(undefined, {})).toBeUndefined();
	});
});

describe("unsubscribe fallbacks", () => {
	test("mailto link prefers reply-to over from", () => {
		expect(
			mailtoUnsubscribeUrl({
				from: "Acme <news@acme.com>",
				replyTo: "help@acme.com",
			}),
		).toBe("mailto:help@acme.com?subject=unsubscribe");
	});

	test("headers without a contact carry only the mailto link", () => {
		expect(
			listUnsubscribeHeaders({ oneClickUrl: null, from: "news@acme.com" }),
		).toEqual({
			"List-Unsubscribe": "<mailto:news@acme.com?subject=unsubscribe>",
		});
	});

	test("one-click headers when a signed link exists", () => {
		const headers = listUnsubscribeHeaders({
			oneClickUrl:
				"https://link.acme.com/api/contacts/v1/preferences/one-click/t",
			from: "news@acme.com",
		});
		expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
		expect(headers["List-Unsubscribe"]).toStartWith(
			"<https://link.acme.com/api/contacts/v1/preferences/one-click/t>",
		);
	});
});
