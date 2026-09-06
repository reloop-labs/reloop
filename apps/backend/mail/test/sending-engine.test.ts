import { describe, expect, test } from "bun:test";
import { evaluateSend } from "../src/sending-engine/guard";
import { buildDnsblQuery, reverseIpv4 } from "../src/sending-engine/ip-check";
import { computeScore, shouldPause } from "../src/sending-engine/reputation";
import type { GuardInput } from "../src/sending-engine/types";
import {
	bucketForAddress,
	overQuota,
	quotaForDay,
	quotasForDay,
} from "../src/sending-engine/warmup";

const base: GuardInput = {
	fromDomain: "acme.com",
	recipients: ["a@gmail.com"],
	egressIp: {
		address: "1.2.3.4",
		pool: "warm-1",
		hostname: "mail.reloop.sh",
		warmupDay: 30,
		health: "ready",
	},
	reputation: {
		bounceRate: 0.01,
		complaintRate: 0.0001,
		dnsblListed: false,
		authHealthy: true,
	},
	sentTodayByProvider: { gmail: 0, outlook: 0, yahoo: 0, other: 0 },
	dnsHealthy: true,
};

describe("warmup", () => {
	test("day 1 quota is tiny, day 30 is large", () => {
		expect(quotaForDay(1, "gmail")).toBe(50);
		expect(quotaForDay(30, "gmail")).toBeGreaterThan(50000);
	});
	test("bucket classification", () => {
		expect(bucketForAddress("x@gmail.com")).toBe("gmail");
		expect(bucketForAddress("x@outlook.com")).toBe("outlook");
		expect(bucketForAddress("x@corp.io")).toBe("other");
	});
	test("overQuota detects breach", () => {
		const q = quotasForDay(1);
		expect(
			overQuota(
				{ gmail: 60, outlook: 0, yahoo: 0, other: 0 },
				base.sentTodayByProvider,
				q,
			),
		).toContain("gmail");
	});
});

describe("reputation", () => {
	test("healthy sender scores high", () => {
		expect(computeScore(base.reputation)).toBeGreaterThan(80);
	});
	test("blocklisted sender pauses", () => {
		expect(shouldPause({ ...base.reputation, dnsblListed: true }).pause).toBe(
			true,
		);
		expect(shouldPause({ ...base.reputation, bounceRate: 0.08 }).pause).toBe(
			true,
		);
	});
});

describe("ip-check", () => {
	test("reverse ipv4", () => {
		expect(reverseIpv4("1.2.3.4")).toBe("4.3.2.1");
		expect(reverseIpv4("::1")).toBeNull();
	});
	test("dnsbl query builder", () => {
		expect(
			buildDnsblQuery("1.2.3.4", { id: "x", host: "zen.spamhaus.org" })
				?.queryName,
		).toBe("4.3.2.1.zen.spamhaus.org");
	});
});

describe("guard", () => {
	test("allows healthy send", () => {
		expect(evaluateSend(base).action).toBe("allow");
	});
	test("throttles new IP over quota", () => {
		const d = evaluateSend({
			...base,
			egressIp: { ...base.egressIp, warmupDay: 1 },
			recipients: Array.from({ length: 60 }, (_, i) => `u${i}@gmail.com`),
		});
		expect(d.action).toBe("throttle");
	});
	test("pauses on blocklist", () => {
		const d = evaluateSend({
			...base,
			reputation: { ...base.reputation, dnsblListed: true },
		});
		expect(d.action).toBe("pause");
	});
	test("reroutes on DNS failure", () => {
		const d = evaluateSend({
			...base,
			dnsHealthy: false,
			missingRecords: ["SPF"],
		});
		expect(d.action).toBe("reroute");
	});
});
