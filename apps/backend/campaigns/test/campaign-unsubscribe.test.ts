import { describe, expect, test } from "bun:test";
import {
	campaignMergeVars,
	interpolate,
} from "../src/lib/campaign/interpolate";
import {
	appendUnsubscribeFooter,
	extractSenderDomain,
	hasUnsubscribeContent,
	oneClickUnsubscribeUrl,
	preferencesPageUrl,
	signPreferencesToken,
	unsubscribePageUrl,
} from "../src/lib/campaign/unsubscribe";

describe("signPreferencesToken", () => {
	test("produces a two-part token", async () => {
		const token = await signPreferencesToken({
			contactId: "con_123",
			organizationId: "org_123",
		});
		expect(token.split(".")).toHaveLength(2);
	});

	test("tokens differ per contact", async () => {
		const a = await signPreferencesToken({
			contactId: "con_a",
			organizationId: "org_123",
		});
		const b = await signPreferencesToken({
			contactId: "con_b",
			organizationId: "org_123",
		});
		expect(a).not.toBe(b);
	});
});

describe("unsubscribe urls", () => {
	test("campaign unsubscribe is a dedicated page, not the preference center", () => {
		expect(unsubscribePageUrl("tok.abc")).toContain(
			"/preferences/unsubscribe/tok.abc",
		);
		expect(preferencesPageUrl("tok.abc")).toContain("/preferences/tok.abc");
		expect(oneClickUnsubscribeUrl("tok.abc")).toContain(
			"/api/contacts/v1/preferences/one-click/tok.abc",
		);
	});

	test("custom tracking base keeps sender and unsubscribe domains aligned", () => {
		expect(unsubscribePageUrl("tok.abc", "https://link.example.com")).toBe(
			"https://link.example.com/preferences/unsubscribe/tok.abc",
		);
		expect(preferencesPageUrl("tok.abc", "https://link.example.com")).toBe(
			"https://link.example.com/preferences/tok.abc",
		);
		expect(oneClickUnsubscribeUrl("tok.abc", "https://link.example.com")).toBe(
			"https://link.example.com/api/contacts/v1/preferences/one-click/tok.abc",
		);
	});
});

describe("extractSenderDomain", () => {
	test("parses bare and display-name from addresses", () => {
		expect(extractSenderDomain("news@example.com")).toBe("example.com");
		expect(extractSenderDomain("News <news@example.com>")).toBe("example.com");
		expect(extractSenderDomain("not-an-email")).toBeNull();
	});
});

describe("hasUnsubscribeContent", () => {
	test("detects existing unsubscribe affordances", () => {
		expect(hasUnsubscribeContent('<a href="x">Unsubscribe</a>')).toBe(true);
		expect(hasUnsubscribeContent("{{{unsubscribe_url}}}")).toBe(true);
		expect(hasUnsubscribeContent("/preferences/unsubscribe/tok.abc")).toBe(
			true,
		);
		expect(hasUnsubscribeContent("<p>Hello</p>")).toBe(false);
	});
});

describe("appendUnsubscribeFooter", () => {
	test("appends footer only when missing", () => {
		const withFooter = appendUnsubscribeFooter(
			"<p>Hello</p>",
			"https://example.com/preferences/unsubscribe/tok",
		);
		expect(withFooter).toContain("Unsubscribe");
		expect(withFooter).toContain(
			"https://example.com/preferences/unsubscribe/tok",
		);
		expect(withFooter).toContain('data-unsubscribe-link="true"');
		expect(withFooter).toMatch(
			/<a href="https:\/\/example.com\/preferences\/unsubscribe\/tok"[^>]*>Unsubscribe<\/a>/,
		);

		const untouched = appendUnsubscribeFooter(
			'<p>Hello <a href="x">unsubscribe here</a></p>',
			"https://example.com/preferences/unsubscribe/tok",
		);
		expect(untouched).not.toContain("example.com");
	});

	test("injects before closing body tag", () => {
		const out = appendUnsubscribeFooter(
			"<html><body><p>Hi</p></body></html>",
			"https://example.com/u",
		);
		expect(out.indexOf("Unsubscribe")).toBeLessThan(out.indexOf("</body>"));
	});
});

describe("unsubscribe merge vars", () => {
	test("exposes unsubscribe_url aliases for manual placement", () => {
		const vars = campaignMergeVars({
			email: "a@b.co",
			unsubscribeUrl: "https://example.com/u",
		});
		expect(vars.unsubscribe_url).toBe("https://example.com/u");
		expect(vars.UNSUBSCRIBE_URL).toBe("https://example.com/u");
		expect(interpolate("click {{{unsubscribe_url}}}", vars)).toBe(
			"click https://example.com/u",
		);
	});

	test("defaults to empty string without a url (csv recipients)", () => {
		const vars = campaignMergeVars({ email: "a@b.co" });
		expect(interpolate("click {{{unsubscribe_url}}}", vars)).toBe("click ");
	});
});
