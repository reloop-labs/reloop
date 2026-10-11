import { afterEach, describe, expect, test } from "bun:test";
import { decryptSecretStrict, encryptSecretStrict } from "@reloop/db";
import { normalizeRelayDomain } from "../src/lib/relay-domain";
import {
	assertSecurityAllowed,
	presentSmtpProvider,
	resolveSmtpHost,
	type SmtpProviderRow,
} from "../src/lib/smtp-provider";

const ORIGINAL_KEY = process.env.WEBHOOK_ENCRYPTION_KEY;
const ORIGINAL_SELF_HOSTED = process.env.SELF_HOSTED;

afterEach(() => {
	process.env.WEBHOOK_ENCRYPTION_KEY = ORIGINAL_KEY;
	process.env.SELF_HOSTED = ORIGINAL_SELF_HOSTED;
	if (ORIGINAL_KEY === undefined) delete process.env.WEBHOOK_ENCRYPTION_KEY;
	if (ORIGINAL_SELF_HOSTED === undefined) delete process.env.SELF_HOSTED;
});

const row: SmtpProviderRow = {
	id: "smtp_abc",
	organizationId: "org_1",
	name: "SendGrid",
	host: "smtp.sendgrid.net",
	port: 587,
	security: "starttls",
	username: "apikey",
	passwordEnc: "enc:aa:bb:cc",
	status: "unverified",
	lastTestedAt: null,
	lastError: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("presentSmtpProvider", () => {
	test("never exposes the stored password and lists relayed domains", () => {
		const out = presentSmtpProvider({
			...row,
			domains: [{ id: "domain_1", domain: "example.com" }],
		});
		expect(out.hasPassword).toBe(true);
		expect(out.domains).toEqual([{ id: "domain_1", domain: "example.com" }]);
		expect(JSON.stringify(out)).not.toContain("enc:");
		expect(out).not.toHaveProperty("passwordEnc");
	});
});

describe("strict secret encryption", () => {
	test("throws instead of storing plaintext when no key is configured", () => {
		delete process.env.WEBHOOK_ENCRYPTION_KEY;
		expect(() => encryptSecretStrict("hunter2")).toThrow();
	});

	test("round-trips with a key", () => {
		process.env.WEBHOOK_ENCRYPTION_KEY = "a".repeat(64);
		const enc = encryptSecretStrict("hunter2");
		expect(enc.startsWith("enc:")).toBe(true);
		expect(decryptSecretStrict(enc)).toBe("hunter2");
	});

	test("refuses to treat plaintext as a decrypted secret", () => {
		process.env.WEBHOOK_ENCRYPTION_KEY = "a".repeat(64);
		expect(() => decryptSecretStrict("hunter2")).toThrow();
	});
});

describe("assertSecurityAllowed", () => {
	test("blocks plaintext relays on hosted Reloop", () => {
		delete process.env.SELF_HOSTED;
		expect(() => assertSecurityAllowed("none")).toThrow();
		expect(() => assertSecurityAllowed("starttls")).not.toThrow();
	});

	test("allows plaintext when self-hosted", () => {
		process.env.SELF_HOSTED = "true";
		expect(() => assertSecurityAllowed("none")).not.toThrow();
	});
});

describe("resolveSmtpHost", () => {
	test("rejects loopback and private targets on hosted Reloop", async () => {
		delete process.env.SELF_HOSTED;
		await expect(resolveSmtpHost("127.0.0.1")).rejects.toThrow(
			"SMTP host not allowed",
		);
		await expect(resolveSmtpHost("10.0.0.5")).rejects.toThrow(
			"SMTP host not allowed",
		);
	});

	test("allows LAN relays when self-hosted", async () => {
		process.env.SELF_HOSTED = "true";
		const target = await resolveSmtpHost("10.0.0.5");
		expect(target.pinnedIp).toBe("10.0.0.5");
	});
});

describe("normalizeRelayDomain", () => {
	test("lowercases and trims the sending domain", () => {
		expect(normalizeRelayDomain("  Mail.Example.COM. ")).toBe(
			"mail.example.com",
		);
	});

	test("rejects www hosts", () => {
		expect(() => normalizeRelayDomain("www.example.com")).toThrow();
	});
});
