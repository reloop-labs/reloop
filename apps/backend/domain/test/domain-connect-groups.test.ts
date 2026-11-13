import { describe, expect, it } from "bun:test";
import {
	determineGroupIds,
	lookupDmarc,
	parseDmarcPolicy,
} from "@reloop/domain/utils/domain-connect-groups";

const sending = { isSendingEmailEnabled: true, isReceivingEmailEnabled: false };
const dnsError = (code: string) => Object.assign(new Error(code), { code });

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
		expect(await lookupDmarc("a.com", async () => [])).toBe("absent");
		expect(
			await lookupDmarc("a.com", async () => {
				throw dnsError("ENOTFOUND");
			}),
		).toBe("absent");
		expect(
			await lookupDmarc("a.com", async () => {
				throw dnsError("ETIMEOUT");
			}),
		).toBe("unknown");
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
