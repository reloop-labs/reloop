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
	return env === "development" || env === "dev";
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
	});
});
