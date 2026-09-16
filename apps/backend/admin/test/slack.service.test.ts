import { describe, expect, test } from "bun:test";
import {
	buildDomainAddedSlackPayload,
	buildEmailFailureSlackPayload,
	buildSigninSlackPayload,
	buildSupportSlackPayload,
	isSystemEmail,
	resetEmailFailureThrottleForTesting,
	sendSlackDomainAddedNotification,
	sendSlackEmailFailureNotification,
	sendSlackSigninNotification,
	sendSlackSupportNotification,
	shouldThrottleEmailFailure,
} from "@reloop/admin/services/slack/slack.service";

describe("Slack Notification Service", () => {
	describe("isSystemEmail", () => {
		test("identifies Reloop system domains and auth addresses", () => {
			expect(isSystemEmail("auth@mail.reloop.sh")).toBe(true);
			expect(isSystemEmail("security@mail.reloop.sh")).toBe(true);
			expect(isSystemEmail("onboarding@reloop.email")).toBe(true);
			expect(isSystemEmail("onboarding@mail.reloop.sh")).toBe(true);
			expect(isSystemEmail("AUTH@MAIL.RELOOP.SH")).toBe(true);
		});

		test("identifies non-system customer addresses", () => {
			expect(isSystemEmail("support@acme.com")).toBe(false);
			expect(isSystemEmail("hello@customer.org")).toBe(false);
			expect(isSystemEmail("billing@example.org")).toBe(false);
		});
	});

	describe("buildSupportSlackPayload", () => {
		test("constructs Block Kit payload with user details, message, and console button", () => {
			const payload = buildSupportSlackPayload(
				{
					conversationId: "conv_12345",
					userName: "Jane Doe",
					userEmail: "jane@example.com",
					orgName: "Acme Corp",
					orgId: "org_12345",
					body: "Need help configuring DNS records",
				},
				"https://reloop.sh",
			);

			expect(payload.text).toContain("Jane Doe");
			expect(payload.blocks).toHaveLength(4);

			// Header block
			expect(payload.blocks[0]?.type).toBe("header");

			// Section with user and org
			const section = payload.blocks[1] as {
				type: string;
				fields: Array<{ type: string; text: string }>;
			};
			expect(section.type).toBe("section");
			expect(section.fields[0]?.text).toContain("Jane Doe");
			expect(section.fields[0]?.text).toContain("mailto:jane@example.com");
			expect(section.fields[1]?.text).toContain("Acme Corp (org_12345)");

			// Message body quote
			const msgBlock = payload.blocks[2] as {
				type: string;
				text: { text: string };
			};
			expect(msgBlock.text.text).toContain("Need help configuring DNS records");

			// Action button linking to console support desk
			const actions = payload.blocks[3] as {
				type: string;
				elements: Array<{ url: string; style: string }>;
			};
			expect(actions.elements[0]?.url).toBe(
				"https://reloop.sh/console/support?c=conv_12345",
			);
		});

		test("escapes special characters in names and bodies", () => {
			const payload = buildSupportSlackPayload(
				{
					conversationId: "conv_123",
					userName: "Jane <Hacker> & Co",
					userEmail: "jane@test.com",
					body: "Testing <script>alert(1)</script> & special chars",
				},
				"https://reloop.sh",
			);

			const msgBlock = payload.blocks[2] as {
				type: string;
				text: { text: string };
			};
			expect(msgBlock.text.text).toContain("&lt;script&gt;");
			expect(msgBlock.text.text).toContain("&amp;");
		});
	});

	describe("buildEmailFailureSlackPayload", () => {
		test("formats critical system email failure as P0 with danger button", () => {
			const payload = buildEmailFailureSlackPayload(
				{
					emailLogId: "eml_123",
					fromEmail: "auth@mail.reloop.sh",
					toEmails: ["user@example.com"],
					subject: "Your verification code",
					errorMessage: "SMTP 550 5.1.1 User unknown",
					orgName: "Platform System",
				},
				"https://reloop.sh",
			);

			expect(payload.text).toContain("P0 - SYSTEM EMAIL FAILURE");
			const header = payload.blocks[0] as {
				type: string;
				text: { text: string };
			};
			expect(header.text.text).toContain("P0 - SYSTEM EMAIL FAILURE");

			const actions = payload.blocks[3] as {
				type: string;
				elements: Array<{ url: string; style: string }>;
			};
			expect(actions.elements[0]?.style).toBe("danger");
			expect(actions.elements[0]?.url).toContain(
				"https://reloop.sh/console/emails?q=user%40example.com",
			);
		});

		test("formats standard customer email failure with warning header", () => {
			const payload = buildEmailFailureSlackPayload(
				{
					emailLogId: "eml_456",
					fromEmail: "newsletter@customer.com",
					toEmails: ["target@domain.com"],
					subject: "Weekly Deals",
					errorMessage: "Connection timed out",
					orgName: "Customer Inc",
				},
				"https://reloop.sh",
			);

			expect(payload.text).toContain("EMAIL DELIVERY FAILURE");
			const header = payload.blocks[0] as {
				type: string;
				text: { text: string };
			};
			expect(header.text.text).toBe("⚠️ EMAIL DELIVERY FAILURE");
		});
	});

	describe("buildSigninSlackPayload", () => {
		test("formats a returning sign-in with session details and users search link", () => {
			const payload = buildSigninSlackPayload(
				{
					email: "jane@example.com",
					fullName: "Jane Doe",
					browser: "Chrome 128",
					os: "macOS",
					ip: "203.0.113.10",
					location: "San Francisco, US",
				},
				"https://reloop.sh",
			);

			expect(payload.text).toContain("User signed in");
			expect(payload.text).toContain("Jane Doe");
			expect(payload.text).toContain("jane@example.com");

			const header = payload.blocks[0] as {
				type: string;
				text: { text: string };
			};
			expect(header.text.text).toBe("🔑 User signed in");

			const section = payload.blocks[1] as {
				type: string;
				fields: Array<{ type: string; text: string }>;
			};
			expect(section.fields[0]?.text).toContain("Jane Doe");
			expect(section.fields[0]?.text).toContain("mailto:jane@example.com");
			expect(
				section.fields.some((field) => field.text.includes("Chrome 128")),
			).toBe(true);
			expect(
				section.fields.some((field) => field.text.includes("203.0.113.10")),
			).toBe(true);

			const actions = payload.blocks[2] as {
				type: string;
				elements: Array<{ url: string }>;
			};
			expect(actions.elements[0]?.url).toBe(
				"https://reloop.sh/console/users?q=jane%40example.com",
			);
		});

		test("formats a new-user sign-in and links to the user hub", () => {
			const payload = buildSigninSlackPayload(
				{
					email: "new@example.com",
					fullName: "New User",
					userId: "user_abc",
					isNewUser: true,
				},
				"https://reloop.sh",
			);

			const header = payload.blocks[0] as {
				type: string;
				text: { text: string };
			};
			expect(header.text.text).toBe("👋 New user signed in");

			const actions = payload.blocks[2] as {
				type: string;
				elements: Array<{ url: string }>;
			};
			expect(actions.elements[0]?.url).toBe(
				"https://reloop.sh/console/users/user_abc",
			);
		});

		test("escapes special characters in sign-in fields", () => {
			const payload = buildSigninSlackPayload(
				{
					email: "jane@example.com",
					fullName: "Jane <Hacker> & Co",
					browser: "Chrome <script>",
				},
				"https://reloop.sh",
			);

			const section = payload.blocks[1] as {
				type: string;
				fields: Array<{ type: string; text: string }>;
			};
			expect(section.fields[0]?.text).toContain("Jane &lt;Hacker&gt; &amp; Co");
			expect(
				section.fields.some((field) => field.text.includes("&lt;script&gt;")),
			).toBe(true);
		});
	});

	describe("buildDomainAddedSlackPayload", () => {
		test("formats a new domain with org, adder, and console buttons", () => {
			const payload = buildDomainAddedSlackPayload(
				{
					domain: "acme.com",
					domainId: "domain_123",
					orgName: "Acme Corp",
					orgId: "org_12345",
					userName: "Jane Doe",
					userEmail: "jane@acme.com",
				},
				"https://reloop.sh",
			);

			expect(payload.text).toContain("Domain added");
			expect(payload.text).toContain("acme.com");
			expect(payload.text).toContain("Acme Corp (org_12345)");

			const header = payload.blocks[0] as {
				type: string;
				text: { text: string };
			};
			expect(header.text.text).toBe("🌐 Domain added");

			const section = payload.blocks[1] as {
				type: string;
				fields: Array<{ type: string; text: string }>;
			};
			expect(section.fields[0]?.text).toContain("acme.com");
			expect(section.fields[1]?.text).toContain("Acme Corp (org_12345)");
			expect(section.fields[2]?.text).toContain("Jane Doe (jane@acme.com)");

			const actions = payload.blocks[2] as {
				type: string;
				elements: Array<{ url: string }>;
			};
			expect(actions.elements[0]?.url).toBe(
				"https://reloop.sh/console/domains?q=acme.com",
			);
			expect(actions.elements[1]?.url).toBe(
				"https://reloop.sh/console/organizations/org_12345",
			);
		});

		test("formats a restored domain with a distinct header", () => {
			const payload = buildDomainAddedSlackPayload(
				{
					domain: "restored.com",
					domainId: "domain_456",
					orgId: "org_456",
					restored: true,
				},
				"https://reloop.sh",
			);

			expect(payload.text).toContain("Domain restored");
			const header = payload.blocks[0] as {
				type: string;
				text: { text: string };
			};
			expect(header.text.text).toBe("🌐 Domain restored");
		});
	});

	describe("Throttling logic", () => {
		test("never throttles system emails even in high volumes", () => {
			resetEmailFailureThrottleForTesting();
			const now = Date.now();
			for (let i = 0; i < 20; i++) {
				expect(shouldThrottleEmailFailure("auth@mail.reloop.sh", now)).toBe(
					false,
				);
			}
		});

		test("throttles customer email failure alerts after 5 failures in 60 seconds", () => {
			resetEmailFailureThrottleForTesting();
			const now = Date.now();
			for (let i = 0; i < 5; i++) {
				expect(shouldThrottleEmailFailure("sales@customer.com", now)).toBe(
					false,
				);
			}
			expect(shouldThrottleEmailFailure("sales@customer.com", now)).toBe(true);
			expect(shouldThrottleEmailFailure("sales@customer.com", now + 1000)).toBe(
				true,
			);

			expect(
				shouldThrottleEmailFailure("sales@customer.com", now + 65_000),
			).toBe(false);
		});
	});

	describe("Graceful handling when webhook is unconfigured", () => {
		test("safely returns false when webhook URL is empty", async () => {
			const supportResult = await sendSlackSupportNotification(
				{
					conversationId: "conv_test",
					userName: "Test User",
					userEmail: "test@example.com",
					body: "Hello",
				},
				{ webhookUrl: "" },
			);
			expect(supportResult).toBe(false);

			const emailResult = await sendSlackEmailFailureNotification(
				{
					emailLogId: "eml_test",
					fromEmail: "test@example.com",
					toEmails: ["dest@example.com"],
					subject: "Test",
					errorMessage: "Failed",
				},
				{ webhookUrl: "" },
			);
			expect(emailResult).toBe(false);

			const signinResult = await sendSlackSigninNotification(
				{
					email: "test@example.com",
					fullName: "Test User",
				},
				{ webhookUrl: "" },
			);
			expect(signinResult).toBe(false);

			const domainResult = await sendSlackDomainAddedNotification(
				{
					domain: "example.com",
					domainId: "domain_test",
				},
				{ webhookUrl: "" },
			);
			expect(domainResult).toBe(false);
		});
	});

	describe("Dispatching notifications", () => {
		test("sends support payload to configured webhook via fetcher", async () => {
			let calledUrl = "";
			let calledPayload: unknown = null;

			const mockFetcher = async (url: string, init?: RequestInit) => {
				calledUrl = url;
				if (typeof init?.body === "string") {
					calledPayload = JSON.parse(init.body);
				}
				return new Response("ok", { status: 200 });
			};

			const result = await sendSlackSupportNotification(
				{
					conversationId: "conv_test",
					userName: "Test User",
					userEmail: "test@example.com",
					body: "Hello Slack",
				},
				{
					webhookUrl: "https://hooks.slack.com/mock-webhook",
					fetcher: mockFetcher,
				},
			);

			expect(result).toBe(true);
			expect(calledUrl).toBe("https://hooks.slack.com/mock-webhook");
			expect((calledPayload as { text: string }).text).toContain("Test User");
		});

		test("sends email failure payload to configured webhook via fetcher", async () => {
			let calledUrl = "";
			let calledPayload: unknown = null;

			const mockFetcher = async (url: string, init?: RequestInit) => {
				calledUrl = url;
				if (typeof init?.body === "string") {
					calledPayload = JSON.parse(init.body);
				}
				return new Response("ok", { status: 200 });
			};

			const result = await sendSlackEmailFailureNotification(
				{
					emailLogId: "eml_test",
					fromEmail: "auth@mail.reloop.sh",
					toEmails: ["test@example.com"],
					subject: "OTP Verification",
					errorMessage: "Connection refused",
				},
				{
					webhookUrl: "https://hooks.slack.com/mock-webhook",
					fetcher: mockFetcher,
				},
			);

			expect(result).toBe(true);
			expect(calledUrl).toBe("https://hooks.slack.com/mock-webhook");
			expect((calledPayload as { text: string }).text).toContain(
				"P0 - SYSTEM EMAIL FAILURE",
			);
		});

		test("sends sign-in payload to configured webhook via fetcher", async () => {
			let calledUrl = "";
			let calledPayload: unknown = null;

			const mockFetcher = async (url: string, init?: RequestInit) => {
				calledUrl = url;
				if (typeof init?.body === "string") {
					calledPayload = JSON.parse(init.body);
				}
				return new Response("ok", { status: 200 });
			};

			const result = await sendSlackSigninNotification(
				{
					email: "jane@example.com",
					fullName: "Jane Doe",
					ip: "203.0.113.10",
				},
				{
					webhookUrl: "https://hooks.slack.com/mock-webhook",
					fetcher: mockFetcher,
				},
			);

			expect(result).toBe(true);
			expect(calledUrl).toBe("https://hooks.slack.com/mock-webhook");
			expect((calledPayload as { text: string }).text).toContain("Jane Doe");
			expect((calledPayload as { text: string }).text).toContain(
				"User signed in",
			);
		});

		test("sends domain-added payload to configured webhook via fetcher", async () => {
			let calledUrl = "";
			let calledPayload: unknown = null;

			const mockFetcher = async (url: string, init?: RequestInit) => {
				calledUrl = url;
				if (typeof init?.body === "string") {
					calledPayload = JSON.parse(init.body);
				}
				return new Response("ok", { status: 200 });
			};

			const result = await sendSlackDomainAddedNotification(
				{
					domain: "acme.com",
					domainId: "domain_test",
					orgName: "Acme Corp",
					orgId: "org_123",
				},
				{
					webhookUrl: "https://hooks.slack.com/mock-webhook",
					fetcher: mockFetcher,
				},
			);

			expect(result).toBe(true);
			expect(calledUrl).toBe("https://hooks.slack.com/mock-webhook");
			expect((calledPayload as { text: string }).text).toContain("acme.com");
			expect((calledPayload as { text: string }).text).toContain(
				"Domain added",
			);
		});
	});
});
