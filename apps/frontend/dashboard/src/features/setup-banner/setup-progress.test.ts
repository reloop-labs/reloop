import { describe, expect, it } from "vitest";
import {
	deriveSetupProgress,
	extractSenderDomain,
	formatOwnDomainFrom,
	hasSentFromOwnDomain,
} from "./setup-progress";

describe("extractSenderDomain", () => {
	it("reads a bare address", () => {
		expect(extractSenderDomain("hello@acme.com")).toBe("acme.com");
	});

	it("reads a display-name address", () => {
		expect(extractSenderDomain("Acme <hello@acme.com>")).toBe("acme.com");
	});

	it("lowercases the host", () => {
		expect(extractSenderDomain("Hello@ACME.COM")).toBe("acme.com");
	});
});

describe("formatOwnDomainFrom", () => {
	it("uses the org name when present", () => {
		expect(formatOwnDomainFrom("Acme", "acme.com")).toBe(
			"Acme <hello@acme.com>",
		);
	});

	it("strips quotes and angle brackets from the org name", () => {
		expect(formatOwnDomainFrom('Acme "Labs" <Inc>', "acme.com")).toBe(
			"Acme Labs Inc <hello@acme.com>",
		);
	});

	it("falls back to a bare address", () => {
		expect(formatOwnDomainFrom("", "acme.com")).toBe("hello@acme.com");
	});
});

describe("hasSentFromOwnDomain", () => {
	it("ignores platform onboarding sends", () => {
		expect(
			hasSentFromOwnDomain(
				[{ fromEmail: "Reloop <onboarding@reloop.email>" }],
				[{ id: "d1", domain: "acme.com", status: "active" }],
			),
		).toBe(false);
	});

	it("matches a customer domain", () => {
		expect(
			hasSentFromOwnDomain(
				[{ fromEmail: "Acme <hello@acme.com>" }],
				[{ id: "d1", domain: "acme.com", status: "active" }],
			),
		).toBe(true);
	});
});

describe("deriveSetupProgress", () => {
	it("starts with every step incomplete", () => {
		const progress = deriveSetupProgress({
			domains: [],
			apiKeyCount: 0,
			sentFromOwnDomain: false,
		});
		expect(progress.completedCount).toBe(0);
		expect(progress.allComplete).toBe(false);
		expect(progress.steps.map((s) => s.id)).toEqual([
			"apiKey",
			"domain",
			"send",
		]);
		expect(progress.steps[0]?.href).toBe("/api-keys?modal=create-api-key");
		expect(progress.steps[1]?.href).toBe("/domain/add");
		expect(progress.steps[2]?.cta).toBe("Send Email");
		expect(progress.steps[2]?.disabled).toBe(true);
	});

	it("marks add-domain done when a pending domain exists and points send at DNS", () => {
		const progress = deriveSetupProgress({
			domains: [{ id: "d1", domain: "acme.com", status: "pending" }],
			apiKeyCount: 1,
			sentFromOwnDomain: false,
		});
		expect(progress.steps[0]?.complete).toBe(true);
		expect(progress.steps[0]?.id).toBe("apiKey");
		expect(progress.steps[1]?.id).toBe("domain");
		expect(progress.steps[1]?.complete).toBe(true);
		expect(progress.steps[1]?.cta).toBe("Finish DNS");
		expect(progress.steps[2]?.id).toBe("send");
		expect(progress.steps[2]?.complete).toBe(false);
		expect(progress.steps[2]?.cta).toBe("Verify DNS");
		expect(progress.steps[2]?.href).toBe("/domain/d1");
		expect(progress.steps[2]?.action).toBeUndefined();
		expect(progress.completedCount).toBe(2);
	});

	it("enables send-test when a domain is active", () => {
		const progress = deriveSetupProgress({
			domains: [{ id: "d1", domain: "acme.com", status: "active" }],
			apiKeyCount: 1,
			sentFromOwnDomain: false,
		});
		expect(progress.activeDomain?.domain).toBe("acme.com");
		expect(progress.steps[2]?.action).toBe("send");
		expect(progress.steps[2]?.cta).toBe("Send test");
		expect(progress.steps[2]?.description).toContain("hello@acme.com");
	});

	it("is complete when all three steps are done", () => {
		const progress = deriveSetupProgress({
			domains: [{ id: "d1", domain: "acme.com", status: "active" }],
			apiKeyCount: 1,
			sentFromOwnDomain: true,
		});
		expect(progress.allComplete).toBe(true);
		expect(progress.completedCount).toBe(3);
	});
});
