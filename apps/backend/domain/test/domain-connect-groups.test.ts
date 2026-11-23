import { describe, expect, it } from "bun:test";
import {
	determineGroupIds,
	lookupDmarc,
	parseDmarcPolicy,
} from "@reloop/domain/utils/domain-connect-groups";

const sending = { isSendingEmailEnabled: true, isReceivingEmailEnabled: false };
const dnsError = (code: string) => Object.assign(new Error(code), { code });
const noAlias = async (): Promise<string[]> => {
	throw dnsError("ENOTFOUND");
};

describe("determineGroupIds", () => {
	it("keeps today's groups when the template has no dmarc group", () => {
		expect(determineGroupIds({})).toEqual([
			"verification",
			"sending",
			"receiving",
		]);
		expect(
			determineGroupIds(sending, { dmarcGroup: false, dmarc: "absent" }),
		).toEqual(["verification", "sending"]);
	});

	it("adds dmarc only when the domain has none", () => {
		expect(
			determineGroupIds(sending, { dmarcGroup: true, dmarc: "absent" }),
		).toEqual(["verification", "sending", "dmarc"]);
		expect(
			determineGroupIds(sending, { dmarcGroup: true, dmarc: "present" }),
		).toEqual(["verification", "sending"]);
	});

	it("does not apply a template whose policy differs from the configured one", () => {
		expect(
			determineGroupIds(sending, {
				dmarcGroup: true,
				dmarc: "absent",
				policyMatchesTemplate: false,
			}),
		).not.toContain("dmarc");
	});

	it("never adds dmarc when the lookup failed or sending is off", () => {
		expect(
			determineGroupIds(sending, { dmarcGroup: true, dmarc: "unknown" }),
		).not.toContain("dmarc");
		expect(
			determineGroupIds(
				{ isSendingEmailEnabled: false },
				{ dmarcGroup: true, dmarc: "absent" },
			),
		).not.toContain("dmarc");
	});
});

describe("lookupDmarc", () => {
	it("queries _dmarc.<domain> and detects an existing record split across chunks", async () => {
		let asked = "";
		const result = await lookupDmarc("send.example.com", async (name) => {
			asked = name;
			return [
				["v=spf1 -all"],
				["v=DMAR", "C1; p=none; rua=mailto:x@example.com"],
			];
		});
		expect(asked).toBe("_dmarc.send.example.com");
		expect(result).toBe("present");
	});

	it("treats NXDOMAIN / no data as absent and other failures as unknown", async () => {
		expect(await lookupDmarc("a.com", async () => [], undefined, noAlias)).toBe(
			"absent",
		);
		expect(
			await lookupDmarc(
				"a.com",
				async () => {
					throw dnsError("ENOTFOUND");
				},
				undefined,
				noAlias,
			),
		).toBe("absent");
		expect(
			await lookupDmarc(
				"a.com",
				async () => {
					throw dnsError("ETIMEOUT");
				},
				undefined,
				noAlias,
			),
		).toBe("unknown");
	});
});

describe("lookupDmarc edge cases (review)", () => {
	it("recognises spaces and tabs around = in the version tag", async () => {
		expect(
			await lookupDmarc("a.com", async () => [["v = DMARC1; p=reject;"]]),
		).toBe("present");
		expect(
			await lookupDmarc("a.com", async () => [["v\t=\tDMARC1;p=none"]]),
		).toBe("present");
		expect(
			await lookupDmarc(
				"a.com",
				async () => [["v=DMARC10; p=none"]],
				undefined,
				noAlias,
			),
		).toBe("absent");
	});

	it("treats a lookup that misses the deadline as unknown", async () => {
		const never = () => new Promise<string[][]>(() => {});
		expect(await lookupDmarc("a.com", never, 20)).toBe("unknown");
	});

	it("treats a zone with no authoritative nameservers as unknown", async () => {
		expect(
			await lookupDmarc("a.com", async () => {
				throw dnsError("ENOAUTH");
			}),
		).toBe("unknown");
	});
});

describe("lookupDmarc with a _dmarc CNAME (review)", () => {
	const noTxt = async (): Promise<string[][]> => {
		throw dnsError("ENOTFOUND");
	};

	it("counts a _dmarc alias to a DMARC provider as present", async () => {
		expect(
			await lookupDmarc("a.com", noTxt, undefined, async () => [
				"a-com.dmarc.provider.example",
			]),
		).toBe("present");
	});

	it("is unknown when the alias lookup fails or is unavailable", async () => {
		expect(
			await lookupDmarc("a.com", noTxt, undefined, async () => {
				throw dnsError("ESERVFAIL");
			}),
		).toBe("unknown");
		expect(await lookupDmarc("a.com", noTxt)).toBe("unknown");
	});
});

describe("parseDmarcPolicy", () => {
	it("accepts the three policies and falls back to reject", () => {
		expect(parseDmarcPolicy("none")).toBe("none");
		expect(parseDmarcPolicy(" Quarantine ")).toBe("quarantine");
		expect(parseDmarcPolicy(undefined)).toBe("reject");
		expect(parseDmarcPolicy("off")).toBe("reject");
	});
});
