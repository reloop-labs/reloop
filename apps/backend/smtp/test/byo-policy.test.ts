import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * TypeScript mirror of policy/byo.lua. If a case fails here, update both files.
 */
const SUFFIX = ".byo.reloop.invalid";

function routingDomainFor(providerId: unknown): string | null {
	if (typeof providerId !== "string") return null;
	const match = providerId.match(/^smtp_([A-Za-z0-9]+)$/);
	return match?.[1] ? `${match[1].toLowerCase()}${SUFFIX}` : null;
}

function providerIdFromRoutingDomain(routingDomain: unknown): string | null {
	if (typeof routingDomain !== "string") return null;
	const match = routingDomain.match(/^([A-Za-z0-9]+)\.byo\.reloop\.invalid$/);
	return match?.[1] ? `smtp_${match[1]}` : null;
}

function enableTls(security: string): "Required" | "Disabled" {
	return security === "none" ? "Disabled" : "Required";
}

const policyDir = join(import.meta.dir, "..", "policy");

describe("byo routing domain", () => {
	test("round-trips a provider id", () => {
		const rd = routingDomainFor("smtp_ckx9z2abc");
		expect(rd).toBe("ckx9z2abc.byo.reloop.invalid");
		expect(providerIdFromRoutingDomain(rd)).toBe("smtp_ckx9z2abc");
	});

	test("rejects malformed ids and ordinary domains", () => {
		expect(routingDomainFor(null)).toBeNull();
		expect(routingDomainFor("domain_abc")).toBeNull();
		expect(routingDomainFor("smtp_abc.evil.com")).toBeNull();
		expect(providerIdFromRoutingDomain("gmail.com")).toBeNull();
		expect(providerIdFromRoutingDomain("x.y.byo.reloop.invalid")).toBeNull();
	});

	test("requires verified TLS unless plaintext was chosen", () => {
		expect(enableTls("starttls")).toBe("Required");
		expect(enableTls("none")).toBe("Disabled");
	});
});

describe("policy wiring", () => {
	test("byo.lua exports the helpers used by queue and smtp policy", () => {
		const lua = readFileSync(join(policyDir, "byo.lua"), "utf8");
		expect(lua).toContain("function byo.routing_domain_for");
		expect(lua).toContain("function byo.provider_id_from_routing_domain");
		expect(lua).toContain("function byo.enable_tls");
		expect(lua).toContain("function byo.mx_entry");
		expect(lua).toContain(`'${SUFFIX}'`);
	});

	test("queue.lua relays BYO routing domains with smart-host auth", () => {
		const lua = readFileSync(join(policyDir, "queue.lua"), "utf8");
		expect(lua).toContain("require 'policy.byo'");
		expect(lua).toContain("/v1/smtp-relay");
		expect(lua).toContain("x-internal-secret");
		expect(lua).toContain("kumo.memoize");
		expect(lua).toContain("mx_list = { byo.mx_entry(relay) }");
		expect(lua).toContain(
			"smtp_auth_plain_password = { key_data = relay.password }",
		);
	});

	test("smtp.lua routes only from the org-scoped dkim-key lookup", () => {
		const lua = readFileSync(join(policyDir, "smtp.lua"), "utf8");
		expect(lua).toContain("byo.routing_domain_for(dkim_data.smtpProviderId)");
		expect(lua).toContain("msg:set_meta('routing_domain', relay_domain)");
		expect(lua).not.toContain("X-Reloop-Smtp-Provider");
	});
});
