import { describe, expect, test } from "vitest";
import {
	DEFAULT_UNSUBSCRIBE_LINK_TITLE,
	isUnsubscribeHref,
	UNSUBSCRIBE_HREF_PLACEHOLDER,
	unsubscribeAnchorHtml,
	unsubscribeLinkTitle,
} from "./unsubscribe-link";

describe("unsubscribe link", () => {
	test("recognizes merge-var hrefs", () => {
		expect(isUnsubscribeHref("{{{unsubscribe_url}}}")).toBe(true);
		expect(isUnsubscribeHref("{{ unsubscribe_url }}")).toBe(true);
		expect(isUnsubscribeHref("https://example.com")).toBe(false);
	});

	test("defaults the visible title to Unsubscribe", () => {
		expect(unsubscribeLinkTitle("")).toBe(DEFAULT_UNSUBSCRIBE_LINK_TITLE);
		expect(unsubscribeLinkTitle(" Stop emails ")).toBe("Stop emails");
	});

	test("serializes an anchor the user can style", () => {
		expect(unsubscribeAnchorHtml("Unsubscribe")).toBe(
			`<a href="${UNSUBSCRIBE_HREF_PLACEHOLDER}" data-unsubscribe-link="true">Unsubscribe</a>`,
		);
	});

	test("href is a merge var so send can fill it without touching the title", () => {
		const html = unsubscribeAnchorHtml("Manage preferences");
		expect(html).toContain(`href="${UNSUBSCRIBE_HREF_PLACEHOLDER}"`);
		expect(
			html.replaceAll(UNSUBSCRIBE_HREF_PLACEHOLDER, "https://example.com/u"),
		).toBe(
			'<a href="https://example.com/u" data-unsubscribe-link="true">Manage preferences</a>',
		);
	});
});
