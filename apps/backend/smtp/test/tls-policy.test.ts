import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * TypeScript mirror of policy/tls.lua. If a case fails here, update both files.
 */
function normalizeTlsMode(mode: unknown): "opportunistic" | "enforced" {
	if (typeof mode === "string" && mode.toLowerCase() === "enforced") {
		return "enforced";
	}
	return "opportunistic";
}

function tlsEgressPool(tenant: string): "tls_enforced" | "tls_opportunistic" {
	if (tenant === "enforced") {
		return "tls_enforced";
	}
	return "tls_opportunistic";
}

function isDevelopment(env: string): boolean {
	return env === "development" || env === "dev" || env === "local";
}

function enableTls(
	env: string,
	egressSource: string,
): "Required" | "OpportunisticInsecure" {
	if (!isDevelopment(env) && egressSource === "tls_enforced") {
		return "Required";
	}
	return "OpportunisticInsecure";
}

const policyDir = join(dirname(fileURLToPath(import.meta.url)), "../policy");
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("normalizeTlsMode", () => {
	test("defaults unknown values to opportunistic", () => {
		expect(normalizeTlsMode(undefined)).toBe("opportunistic");
		expect(normalizeTlsMode(null)).toBe("opportunistic");
		expect(normalizeTlsMode("")).toBe("opportunistic");
		expect(normalizeTlsMode("Opportunistic")).toBe("opportunistic");
		expect(normalizeTlsMode("required")).toBe("opportunistic");
	});

	test("accepts enforced case-insensitively", () => {
		expect(normalizeTlsMode("enforced")).toBe("enforced");
		expect(normalizeTlsMode("Enforced")).toBe("enforced");
		expect(normalizeTlsMode("ENFORCED")).toBe("enforced");
	});
});

describe("tlsEgressPool", () => {
	test("maps tenant to a dedicated source so TLS modes do not share a ready queue", () => {
		expect(tlsEgressPool("enforced")).toBe("tls_enforced");
		expect(tlsEgressPool("opportunistic")).toBe("tls_opportunistic");
		expect(tlsEgressPool("")).toBe("tls_opportunistic");
	});
});

describe("enableTls", () => {
	test("opportunistic uses STARTTLS with plaintext fallback", () => {
		expect(enableTls("production", "tls_opportunistic")).toBe(
			"OpportunisticInsecure",
		);
		expect(enableTls("development", "tls_opportunistic")).toBe(
			"OpportunisticInsecure",
		);
	});

	test("enforced requires TLS only outside local Mailpit", () => {
		expect(enableTls("production", "tls_enforced")).toBe("Required");
		expect(enableTls("development", "tls_enforced")).toBe(
			"OpportunisticInsecure",
		);
		expect(enableTls("dev", "tls_enforced")).toBe("OpportunisticInsecure");
		expect(enableTls("local", "tls_enforced")).toBe("OpportunisticInsecure");
	});
});

describe("policy sources stay wired", () => {
	test("tls.lua exports the functions used by queue and smtp policy", () => {
		const tlsLua = readFileSync(join(policyDir, "tls.lua"), "utf8");
		expect(tlsLua).toContain("function tls.normalize_tls_mode");
		expect(tlsLua).toContain("function tls.egress_pool");
		expect(tlsLua).toContain("function tls.enable_tls");
		expect(tlsLua).toContain("OpportunisticInsecure");
		expect(tlsLua).toContain("Required");
	});

	test("queue.lua selects egress pool and enable_tls from tls.lua", () => {
		const queueLua = readFileSync(join(policyDir, "queue.lua"), "utf8");
		expect(queueLua).toContain("require 'policy.tls'");
		expect(queueLua).toContain("tls.egress_pool(tenant)");
		expect(queueLua).toContain("tls.enable_tls(constants.env, egress_source)");
	});

	test("smtp.lua stamps tenant from log-incoming or X-Reloop-TLS-Mode", () => {
		const smtpLua = readFileSync(join(policyDir, "smtp.lua"), "utf8");
		expect(smtpLua).toContain("X-Reloop-TLS-Mode");
		expect(smtpLua).toContain("utils.apply_tls_mode");
		expect(smtpLua).toContain("body.tls or header_tls_mode");
	});

	test("smtp.lua maps 403 abuse rejections from log-incoming", () => {
		const smtpLua = readFileSync(join(policyDir, "smtp.lua"), "utf8");
		expect(smtpLua).toContain("code == 403");
		expect(smtpLua).toContain("5.7.1 Message rejected");
	});

	test("smtp.lua permanently rejects quota exceeded from log-incoming", () => {
		const smtpLua = readFileSync(join(policyDir, "smtp.lua"), "utf8");
		expect(smtpLua).toContain("code == 402");
		expect(smtpLua).toContain("5.7.1 Email quota exceeded");
	});

	test("smtp.lua charges envelope recipients, not a single To header", () => {
		const smtpLua = readFileSync(join(policyDir, "smtp.lua"), "utf8");
		expect(smtpLua).toContain("function collect_send_recipients");
		expect(smtpLua).toContain("msg:recipient_list()");
		expect(smtpLua).toContain(
			'for _, header_name in ipairs({ "To", "Cc", "Bcc" })',
		);
		expect(smtpLua).not.toMatch(
			/local to_emails = \{\}[\s\S]*get_first_named_header_value\('To'\)[\s\S]*table.insert\(to_emails/,
		);
	});

	test("HTTP inject reuses the mail-service log; customer SMTP cannot skip quota", () => {
		const smtpLua = readFileSync(join(policyDir, "smtp.lua"), "utf8");
		expect(smtpLua).toContain("apply_reloop_logic(msg, api_key, 'smtp')");
		expect(smtpLua).toContain("apply_reloop_logic(msg, api_key, 'http')");
		expect(smtpLua).toContain("Ignoring customer X-Email-Log-ID");
		expect(smtpLua).toContain("trust_log_id = is_internal or source == 'http'");
		expect(smtpLua).toContain(
			"Internal secret requires X-Email-Log-ID (mail service inject only)",
		);
	});

	test("mail inject and log-incoming pass tls through", () => {
		const step6 = readFileSync(
			join(
				repoRoot,
				"apps/backend/mail/src/routes/mail/send-email/steps/step-6-send-email.ts",
			),
			"utf8",
		);
		const logIncoming = readFileSync(
			join(
				repoRoot,
				"apps/backend/domain/src/routes/kumomta/log-incoming/log-incoming.controllers.ts",
			),
			"utf8",
		);
		expect(step6).toContain('"X-Reloop-TLS-Mode": tlsMode');
		expect(logIncoming).toContain("tls: domainRecord.tls");
		expect(logIncoming).toContain("reserveSendCredits");
		expect(logIncoming).toContain("creditsReserved: true");
		expect(logIncoming).toContain("uniqueBareEmails(body.toEmails)");
		expect(logIncoming).toContain("No envelope recipients");
		expect(logIncoming).toContain('decision.cause === "domain_age"');
	});

	test("smtp.lua validates AUTH PLAIN against /v1/smtp-auth", () => {
		const smtpLua = readFileSync(join(policyDir, "smtp.lua"), "utf8");
		expect(smtpLua).toContain("function validate_smtp_api_key");
		expect(smtpLua).toContain("/v1/smtp-auth");
		expect(smtpLua).toContain("smtp_server_auth_plain");
		expect(smtpLua).toContain("4.7.0 Temporary authentication failure");
		expect(smtpLua).not.toContain(
			"actual key + domain verification happens on message receipt",
		);
		const routes = readFileSync(
			join(
				repoRoot,
				"apps/backend/domain/src/routes/kumomta/kumomta.routes.ts",
			),
			"utf8",
		);
		expect(routes).toContain("smtpAuthRoute");
		expect(routes).toContain("./smtp-auth/smtp-auth.route");
		const smtpAuth = readFileSync(
			join(
				repoRoot,
				"apps/backend/domain/src/routes/kumomta/smtp-auth/smtp-auth.route.ts",
			),
			"utf8",
		);
		expect(smtpAuth).toContain('"/smtp-auth"');
		expect(smtpAuth).toContain("authKey: true");
	});

	test("HTTP send refunds credits only when Kumo inject has not succeeded", () => {
		const sendController = readFileSync(
			join(
				repoRoot,
				"apps/backend/mail/src/routes/mail/send-email/send-email.controllers.ts",
			),
			"utf8",
		);
		expect(sendController).toContain("onInjected?.()");
		expect(sendController).toContain("if (!injected)");
		expect(sendController).toContain("refundCreditsForFailedSend(reservation)");
		expect(sendController).toContain("credits kept");
		expect(sendController).toContain("domainRegisteredAt: registeredAt");
	});
});
