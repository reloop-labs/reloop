import { describe, expect, test } from "bun:test";
import {
	buildApiKeyWebhookData,
	buildContactGroupWebhookData,
	buildContactWebhookData,
	buildDomainWebhookData,
	buildEmailWebhookData,
	buildInboundEmailWebhookData,
	statusForEmailWebhookType,
} from "../src/payloads";

describe("webhook payload builders", () => {
	test("email data is snake_case and omits empty error/url", () => {
		const data = buildEmailWebhookData({
			emailId: "em_1",
			from: "a@b.com",
			to: ["c@d.com"],
			subject: "Hi",
			status: "sent",
		});
		expect(data).toEqual({
			email_id: "em_1",
			from: "a@b.com",
			to: ["c@d.com"],
			subject: "Hi",
			status: "sent",
		});
		expect("error" in data).toBe(false);
		expect("url" in data).toBe(false);
	});

	test("email data includes error and url when provided", () => {
		const data = buildEmailWebhookData({
			emailId: "em_1",
			from: "a@b.com",
			to: ["c@d.com"],
			subject: null,
			status: "bounced",
			error: { code: 550, message: "unknown user" },
			url: "https://example.com",
		});
		expect(data.error).toEqual({ code: 550, message: "unknown user" });
		expect(data.url).toBe("https://example.com");
	});

	test("domain data uses id/name/status", () => {
		expect(
			buildDomainWebhookData({
				id: "dom_1",
				name: "example.com",
				status: "active",
			}),
		).toEqual({
			id: "dom_1",
			name: "example.com",
			status: "active",
		});
	});

	test("contact data uses snake_case names", () => {
		expect(
			buildContactWebhookData({
				id: "con_1",
				email: "a@b.com",
				firstName: "Ada",
				lastName: "Lovelace",
				status: "subscribed",
			}),
		).toEqual({
			id: "con_1",
			email: "a@b.com",
			first_name: "Ada",
			last_name: "Lovelace",
			status: "subscribed",
		});
	});

	test("contact group and api key builders", () => {
		expect(buildContactGroupWebhookData({ id: "grp_1", name: "VIP" })).toEqual(
			{ id: "grp_1", name: "VIP" },
		);
		expect(
			buildApiKeyWebhookData({
				apiKeyId: "key_1",
				status: "disabled",
				action: "revoked",
			}),
		).toEqual({
			api_key_id: "key_1",
			status: "disabled",
			action: "revoked",
		});
	});

	test("inbound email data", () => {
		const data = buildInboundEmailWebhookData({
			emailId: "in_1",
			mailboxId: "mb_1",
			from: "sender@example.com",
			to: ["inbox@example.com"],
			subject: "Hello",
		});
		expect(data.status).toBe("received");
		expect(data.mailbox_id).toBe("mb_1");
		expect(data.from_name).toBeNull();
		expect(data.cc).toEqual([]);
	});

	test("statusForEmailWebhookType maps lifecycle types", () => {
		expect(statusForEmailWebhookType("email.delivered")).toBe("delivered");
		expect(statusForEmailWebhookType("email.bounced")).toBe("bounced");
		expect(statusForEmailWebhookType("email.complained")).toBe("spam");
		expect(statusForEmailWebhookType("email.failed")).toBe("failed");
		expect(statusForEmailWebhookType("email.opened")).toBeUndefined();
	});
});
