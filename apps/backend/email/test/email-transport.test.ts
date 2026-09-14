import { describe, expect, test } from "bun:test";
import {
	type EmailTransportConfig,
	resolveEmailTransport,
	SYSTEM_EMAIL_UNCONFIGURED_MESSAGE,
} from "@reloop/email/utils/email-transport";

function config(
	overrides: Partial<EmailTransportConfig> = {},
): EmailTransportConfig {
	return {
		NODE_ENV: "production",
		RELOOP_API_KEY: "",
		SMTP_HOST: "",
		SMTP_PORT: 587,
		SMTP_USER: "",
		SMTP_PASSWORD: "",
		SMTP_SECURE: false,
		MAILPIT_HOST: "localhost",
		MAILPIT_PORT: 1025,
		...overrides,
	};
}

describe("transport selection", () => {
	test("the platform API key wins when set", () => {
		const transport = resolveEmailTransport(
			config({ RELOOP_API_KEY: "rl_prod_x", SMTP_HOST: "smtp.acme.test" }),
		);

		expect(transport).toEqual({ kind: "reloop", apiKey: "rl_prod_x" });
	});

	test("a per-call key overrides the configured one", () => {
		const transport = resolveEmailTransport(
			config({ RELOOP_API_KEY: "rl_prod_x" }),
			"rl_prod_override",
		);

		expect(transport).toEqual({ kind: "reloop", apiKey: "rl_prod_override" });
	});

	test("SMTP is used when there is no API key", () => {
		const transport = resolveEmailTransport(
			config({
				SMTP_HOST: "smtp.acme.test",
				SMTP_PORT: 465,
				SMTP_SECURE: true,
				SMTP_USER: "postmaster",
				SMTP_PASSWORD: "hunter2",
			}),
		);

		expect(transport).toEqual({
			kind: "smtp",
			host: "smtp.acme.test",
			port: 465,
			secure: true,
			user: "postmaster",
			pass: "hunter2",
		});
	});

	test("SMTP without credentials stays unauthenticated", () => {
		const transport = resolveEmailTransport(
			config({ SMTP_HOST: "smtp.internal", SMTP_PORT: 25 }),
		);

		expect(transport).toMatchObject({
			kind: "smtp",
			user: undefined,
			pass: undefined,
		});
	});

	test("whitespace-only values do not count as configured", () => {
		expect(() =>
			resolveEmailTransport(config({ RELOOP_API_KEY: "   ", SMTP_HOST: "  " })),
		).toThrow(SYSTEM_EMAIL_UNCONFIGURED_MESSAGE);
	});
});

describe("production never silently uses Mailpit", () => {
	test("an unconfigured production install refuses to send", () => {
		expect(() => resolveEmailTransport(config())).toThrow(
			SYSTEM_EMAIL_UNCONFIGURED_MESSAGE,
		);
	});

	test("the error names both ways to fix it", () => {
		expect(SYSTEM_EMAIL_UNCONFIGURED_MESSAGE).toContain("RELOOP_API_KEY");
		expect(SYSTEM_EMAIL_UNCONFIGURED_MESSAGE).toContain("SMTP_HOST");
	});

	test("SMTP alone is enough to boot a production install", () => {
		expect(
			resolveEmailTransport(config({ SMTP_HOST: "smtp.acme.test" })).kind,
		).toBe("smtp");
	});
});

describe("development keeps the Mailpit fallback", () => {
	test("an unconfigured dev install falls back to Mailpit", () => {
		const transport = resolveEmailTransport(
			config({ NODE_ENV: "development" }),
		);

		expect(transport).toEqual({
			kind: "mailpit",
			host: "localhost",
			port: 1025,
		});
	});

	test("the Mailpit endpoint is configurable for containerized dev", () => {
		const transport = resolveEmailTransport(
			config({
				NODE_ENV: "development",
				MAILPIT_HOST: "reloop-mailpit",
				MAILPIT_PORT: 1026,
			}),
		);

		expect(transport).toMatchObject({
			kind: "mailpit",
			host: "reloop-mailpit",
			port: 1026,
		});
	});

	test("an unset NODE_ENV is treated as development", () => {
		expect(resolveEmailTransport(config({ NODE_ENV: "" })).kind).toBe(
			"mailpit",
		);
	});
});
