import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";
import { sendTestEmail } from "@be/template/routes/template/test-template/test-template.controllers";
import {
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "@reloop/auth/middleware";

describe("sendTestEmail controller", () => {
	const originalFetch = globalThis.fetch;
	let lastFetchUrl = "";
	let lastFetchOptions: RequestInit | undefined;

	beforeEach(() => {
		lastFetchUrl = "";
		lastFetchOptions = undefined;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("sends test email via Mail service using user credits and template fromEmail", async () => {
		templateModel.findByIdAndOrg = mock(async () => ({
			id: "tpl_123",
			organizationId: "org_abc",
			name: "Welcome Email",
			fromEmail: "team@verified.com",
			subject: "Hello {{{FIRST_NAME}}}",
			replyTo: "reply@verified.com",
			createdByUserId: "usr_xyz",
			variables: [],
		})) as any;

		templateVersionModel.getLatestVersion = mock(async () => ({
			id: "ver_1",
			renderedHtml: "<p>Welcome {{{FIRST_NAME}}} to {{{COMPANY}}}</p>",
		})) as any;

		globalThis.fetch = mock(
			async (url: string | URL | Request, init?: RequestInit) => {
				lastFetchUrl = String(url);
				lastFetchOptions = init;
				return new Response(
					JSON.stringify({ id: "log_1", messageId: "msg_1" }),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			},
		) as any;

		const result = await sendTestEmail({
			templateId: "tpl_123",
			organizationId: "org_abc",
			userId: "usr_operator",
			to: "test@recipient.com",
			variables: { COMPANY: "Acme Corp" },
		});

		expect(result).toEqual({ success: true });
		expect(lastFetchUrl).toContain("/api/mail/v1/send");

		const headers = lastFetchOptions?.headers as Record<string, string>;
		expect(headers[INTERNAL_ORG_ID_HEADER]).toBe("org_abc");
		expect(headers[INTERNAL_USER_ID_HEADER]).toBe("usr_operator");
		expect(headers[INTERNAL_SECRET_HEADER]).toBeDefined();

		const body = JSON.parse(lastFetchOptions?.body as string);
		expect(body.from).toBe("team@verified.com");
		expect(body.to).toBe("test@recipient.com");
		expect(body.subject).toBe("Hello John");
		expect(body.html).toBe("<p>Welcome John to Acme Corp</p>");
		expect(body.reply_to).toBe("reply@verified.com");
		expect(body.tags).toEqual([
			{ name: "template", value: "tpl_123" },
			{ name: "test", value: "true" },
		]);
	});

	test("surfaces error when Mail service rejects (e.g. insufficient credits or unverified domain)", async () => {
		templateModel.findByIdAndOrg = mock(async () => ({
			id: "tpl_123",
			organizationId: "org_abc",
			fromEmail: "team@unverified.com",
			createdByUserId: "usr_xyz",
		})) as any;

		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify({
					message: "Failed to send email",
					why: "Domain unverified.com is not verified for this organization",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}) as any;

		let thrownError: any = null;
		try {
			await sendTestEmail({
				templateId: "tpl_123",
				organizationId: "org_abc",
				to: "test@recipient.com",
				html: "<p>Test</p>",
				variables: {},
			});
		} catch (err) {
			thrownError = err;
		}

		expect(thrownError).toBeDefined();
		expect(thrownError.message).toBe("Failed to send test email");
		expect(thrownError.why).toBe(
			"Domain unverified.com is not verified for this organization",
		);
	});

	test("throws error if fromEmail is missing on both template and parameters", async () => {
		templateModel.findByIdAndOrg = mock(async () => ({
			id: "tpl_123",
			organizationId: "org_abc",
			fromEmail: null,
			createdByUserId: "usr_xyz",
		})) as any;

		let thrownError: any = null;
		try {
			await sendTestEmail({
				templateId: "tpl_123",
				organizationId: "org_abc",
				to: "test@recipient.com",
				html: "<p>Test</p>",
				variables: {},
			});
		} catch (err) {
			thrownError = err;
		}

		expect(thrownError).toBeDefined();
		expect(thrownError.message).toBe("Failed to send test email");
		expect(thrownError.why).toBe(
			"Sender email is required to send a test email. Configure it in template details.",
		);
	});
});
