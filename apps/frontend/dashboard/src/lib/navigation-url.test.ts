import { describe, expect, it } from "vitest";
import {
	buildAppHref,
	normalizeAppPathname,
	parseAppSearch,
	requiresDocumentNavigation,
} from "./navigation-url";

describe("buildAppHref", () => {
	it("interpolates and URL-encodes dynamic route parameters", () => {
		expect(
			buildAppHref({
				to: "/contacts/detail/$contactId",
				params: { contactId: "contact/with space" },
			}),
		).toBe("/contacts/detail/contact%2Fwith%20space");
	});

	it("fails loudly when a required route parameter is missing", () => {
		expect(() => buildAppHref({ to: "/templates/$templateId" })).toThrowError(
			'Missing route parameter "templateId"',
		);
	});

	it("replaces search state and omits undefined values", () => {
		expect(
			buildAppHref({
				to: "/login?stale=true",
				search: { inviteId: undefined, email: "test@example.com" },
			}),
		).toBe("/login?email=test%40example.com");
	});

	it("supports functional search updates that preserve existing keys", () => {
		expect(
			buildAppHref(
				{
					to: "/contacts",
					search: (previous) => ({ ...previous, search: "Ada Lovelace" }),
				},
				{ currentSearch: "?page=2&channelId=channel-1" },
			),
		).toBe("/contacts?page=2&channelId=channel-1&search=Ada+Lovelace");
	});

	it("resolves route-relative parent navigation", () => {
		expect(
			buildAppHref(
				{ to: ".." },
				{ currentPathname: "/dashboard/webhooks/webhook-1/test" },
			),
		).toBe("/webhooks/webhook-1");
	});

	it("preserves embedded search and hash when no search override is provided", () => {
		expect(buildAppHref({ to: "/logs?log=log-1#details" })).toBe(
			"/logs?log=log-1#details",
		);
	});
});

describe("pathname and search normalization", () => {
	it("strips only the dashboard base path", () => {
		expect(normalizeAppPathname("/dashboard")).toBe("/");
		expect(normalizeAppPathname("/dashboard/settings/teams")).toBe(
			"/settings/teams",
		);
		expect(normalizeAppPathname("/dashboard-tools")).toBe("/dashboard-tools");
	});

	it("keeps search values as strings, including numeric-looking OTPs", () => {
		expect(parseAppSearch("?otp=001234&compose=true")).toEqual({
			otp: "001234",
			compose: "true",
		});
	});
});

describe("base-path ownership", () => {
	it("keeps dashboard routes inside Next navigation", () => {
		expect(requiresDocumentNavigation("/contacts")).toBe(false);
		expect(requiresDocumentNavigation("/settings/billing?from=%2F")).toBe(
			false,
		);
	});

	it("keeps host-root and external destinations outside the dashboard base path", () => {
		expect(requiresDocumentNavigation("/api/auth/v1/sign-out")).toBe(true);
		expect(requiresDocumentNavigation("/privacy")).toBe(true);
		expect(requiresDocumentNavigation("/terms-and-conditions")).toBe(true);
		expect(requiresDocumentNavigation("/downloads/export.csv")).toBe(true);
		expect(requiresDocumentNavigation("https://reloop.sh/docs")).toBe(true);
	});
});

describe("modal URL state", () => {
	it("preserves unrelated keys while explicitly closing a modal", () => {
		expect(
			buildAppHref(
				{
					to: "/contacts",
					search: (previous) => ({
						...previous,
						modal: undefined,
						id: undefined,
					}),
				},
				{ currentSearch: "?page=3&modal=edit&id=contact-1" },
			),
		).toBe("/contacts?page=3");
	});
});
