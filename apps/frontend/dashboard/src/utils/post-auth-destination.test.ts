import { describe, expect, it } from "vitest";
import {
	resolvePostAuthDestination,
	sanitizeRedirectUrl,
} from "./post-auth-destination";

describe("sanitizeRedirectUrl", () => {
	it("returns valid relative path", () => {
		expect(sanitizeRedirectUrl("/contact")).toBe("/contact");
		expect(sanitizeRedirectUrl("/about?foo=bar")).toBe("/about?foo=bar");
	});

	it("rejects protocol relative URLs (//)", () => {
		expect(sanitizeRedirectUrl("//malicious.com")).toBeNull();
	});

	it("allows trusted domain absolute URLs", () => {
		expect(sanitizeRedirectUrl("https://local.reloop.sh/contact")).toBe(
			"https://local.reloop.sh/contact",
		);
		expect(sanitizeRedirectUrl("https://reloop.sh/contact")).toBe(
			"https://reloop.sh/contact",
		);
	});

	it("rejects untrusted third party absolute URLs", () => {
		expect(sanitizeRedirectUrl("https://phishing.com/steal")).toBeNull();
	});

	it("handles null or empty inputs", () => {
		expect(sanitizeRedirectUrl(null)).toBeNull();
		expect(sanitizeRedirectUrl("")).toBeNull();
		expect(sanitizeRedirectUrl("   ")).toBeNull();
	});
});

describe("resolvePostAuthDestination", () => {
	const mockDeps = {
		listOrganizations: async () => ({ data: [{ id: "org_1" }] }),
		listUserInvitations: async () => ({ data: [] }),
	};

	it("prioritizes valid redirectTo over default home path", async () => {
		const destination = await resolvePostAuthDestination(
			{ redirectTo: "/contact" },
			mockDeps,
		);
		expect(destination).toBe("/contact");
	});

	it("falls back to / when no redirectTo or inviteId is provided and orgs exist", async () => {
		const destination = await resolvePostAuthDestination({}, mockDeps);
		expect(destination).toBe("/");
	});
});
