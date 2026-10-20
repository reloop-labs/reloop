import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * TypeScript mirror of policy/egress.lua. If a case fails here, update both files.
 */
function parseSourceMap(raw: unknown): Record<string, string> {
	const map: Record<string, string> = {};
	if (typeof raw !== "string") return map;
	for (const entry of raw.split(/[,\s]+/)) {
		const match = entry.match(/^([^=]+)=([^=]+)$/);
		if (match?.[1] && match[2]) map[match[1]] = match[2];
	}
	return map;
}

function tenant(tlsMode: string, address?: string, hostname?: string) {
	if (!address || !hostname) return tlsMode;
	return `${tlsMode}|${address}|${hostname}`;
}

function split(name: string): [string, string | null, string | null] {
	const match = name.match(/^([^|]*)\|([^|]+)\|([^|]+)$/);
	if (match) return [match[1] ?? "", match[2] ?? null, match[3] ?? null];
	return [name, null, null];
}

function source(
	name: string,
	sourceMap: Record<string, string>,
	defaultEhlo: string,
) {
	const [, address, hostname] = split(name);
	if (!address) return { name, ehlo_domain: defaultEhlo };
	const bind = sourceMap[address];
	if (!bind) return null;
	return { name, source_address: bind, ehlo_domain: hostname };
}

const policyDir = join(process.cwd(), "policy");

describe("egress source map", () => {
	test("maps public IPs to local bind addresses", () => {
		expect(
			parseSourceMap("65.109.252.254=172.30.250.10, 203.0.113.7=203.0.113.7"),
		).toEqual({
			"65.109.252.254": "172.30.250.10",
			"203.0.113.7": "203.0.113.7",
		});
	});

	test("ignores empty and malformed entries", () => {
		expect(parseSourceMap("")).toEqual({});
		expect(parseSourceMap(undefined)).toEqual({});
		expect(parseSourceMap("65.109.252.254,=1.2.3.4,a=b=c")).toEqual({});
	});
});

describe("egress tenant", () => {
	test("shared mail keeps the bare TLS mode as tenant", () => {
		expect(tenant("opportunistic")).toBe("opportunistic");
		expect(split("enforced")).toEqual(["enforced", null, null]);
	});

	test("dedicated mail round-trips TLS mode, IP and hostname", () => {
		const t = tenant("enforced", "65.109.252.254", "smtp.reloop.sh");
		expect(t).toBe("enforced|65.109.252.254|smtp.reloop.sh");
		expect(split(t)).toEqual(["enforced", "65.109.252.254", "smtp.reloop.sh"]);
	});
});

describe("egress source", () => {
	const map = { "65.109.252.254": "172.30.250.10" };

	test("shared pools use the host default address", () => {
		expect(source("tls_opportunistic", map, "reloop.sh")).toEqual({
			name: "tls_opportunistic",
			ehlo_domain: "reloop.sh",
		});
	});

	test("dedicated pools bind the mapped address and EHLO as the IP hostname", () => {
		expect(
			source("tls_enforced|65.109.252.254|smtp.reloop.sh", map, "reloop.sh"),
		).toEqual({
			name: "tls_enforced|65.109.252.254|smtp.reloop.sh",
			source_address: "172.30.250.10",
			ehlo_domain: "smtp.reloop.sh",
		});
	});

	test("an unmapped IP is never bound", () => {
		expect(
			source("tls_opportunistic|198.51.100.1|mx.example", map, "reloop.sh"),
		).toBeNull();
	});
});

describe("egress Lua wiring", () => {
	test("egress.lua exports the functions used by queue, smtp and utils", () => {
		const lua = readFileSync(join(policyDir, "egress.lua"), "utf8");
		for (const fn of [
			"parse_source_map",
			"tenant",
			"split",
			"pool_name",
			"source",
		]) {
			expect(lua).toContain(`function egress.${fn}`);
		}
	});

	test("smtp.lua takes the dedicated IP only from the org-scoped dkim-key lookup", () => {
		const smtpLua = readFileSync(join(policyDir, "smtp.lua"), "utf8");
		expect(smtpLua).toContain("recipients = to_emails");
		expect(smtpLua).toContain("dkim_data.egress");
		expect(smtpLua).toContain("not relay_domain");
		expect(smtpLua).not.toMatch(/named_header_value\('X-Reloop-Egress/);
	});

	test("queue.lua binds dedicated sources from EGRESS_SOURCE_MAP", () => {
		const queueLua = readFileSync(join(policyDir, "queue.lua"), "utf8");
		expect(queueLua).toContain("egress.source(source_name, egress_source_map");
		expect(queueLua).toContain("egress.pool_name(");
	});
});
