import { describe, expect, test } from "bun:test";
import {
	isAlwaysBlockedIP,
	isPrivateNetworkIP,
	isPrivateOrBlockedIP,
	resolvePublicTarget,
	SsrfBlockedError,
} from "../src/index";

describe("isPrivateOrBlockedIP", () => {
	test("blocks loopback and private v4", () => {
		expect(isPrivateOrBlockedIP("127.0.0.1")).toBe(true);
		expect(isPrivateOrBlockedIP("10.0.0.5")).toBe(true);
		expect(isPrivateOrBlockedIP("192.168.1.1")).toBe(true);
		expect(isPrivateOrBlockedIP("172.16.0.1")).toBe(true);
		expect(isPrivateOrBlockedIP("172.31.255.255")).toBe(true);
		expect(isPrivateOrBlockedIP("169.254.169.254")).toBe(true);
		expect(isPrivateOrBlockedIP("100.64.0.1")).toBe(true);
		expect(isPrivateOrBlockedIP("0.0.0.0")).toBe(true);
	});

	test("allows public v4", () => {
		expect(isPrivateOrBlockedIP("8.8.8.8")).toBe(false);
		expect(isPrivateOrBlockedIP("1.1.1.1")).toBe(false);
		expect(isPrivateOrBlockedIP("172.32.0.1")).toBe(false);
		expect(isPrivateOrBlockedIP("172.15.0.1")).toBe(false);
	});

	test("blocks private v6", () => {
		expect(isPrivateOrBlockedIP("::1")).toBe(true);
		expect(isPrivateOrBlockedIP("fe80::1")).toBe(true);
		expect(isPrivateOrBlockedIP("fd00::1")).toBe(true);
		expect(isPrivateOrBlockedIP("::ffff:127.0.0.1")).toBe(true);
	});
});

describe("private vs always-blocked ranges", () => {
	test("classifies RFC1918 and loopback as private-network only", () => {
		for (const ip of [
			"127.0.0.1",
			"10.0.0.5",
			"192.168.1.1",
			"172.16.0.1",
			"::1",
			"fd00::1",
			"::ffff:10.0.0.1",
		]) {
			expect(isPrivateNetworkIP(ip)).toBe(true);
			expect(isAlwaysBlockedIP(ip)).toBe(false);
		}
	});

	test("keeps link-local, multicast, unspecified, and reserved always blocked", () => {
		for (const ip of [
			"169.254.169.254",
			"169.254.0.1",
			"0.0.0.0",
			"100.64.0.1",
			"198.18.0.1",
			"224.0.0.1",
			"255.255.255.255",
			"::",
			"fe80::1",
			"::ffff:169.254.169.254",
		]) {
			expect(isAlwaysBlockedIP(ip)).toBe(true);
			expect(isPrivateOrBlockedIP(ip)).toBe(true);
		}
	});
});

describe("resolvePublicTarget", () => {
	test("blocks a private address unless allowPrivate is set", async () => {
		await expect(resolvePublicTarget("127.0.0.1")).rejects.toBeInstanceOf(
			SsrfBlockedError,
		);
		await expect(
			resolvePublicTarget("127.0.0.1", { allowPrivate: false }),
		).rejects.toBeInstanceOf(SsrfBlockedError);
		const target = await resolvePublicTarget("127.0.0.1", {
			allowPrivate: true,
		});
		expect(target.pinnedIp).toBe("127.0.0.1");
	});

	test("allowPrivate still blocks metadata and other non-private ranges", async () => {
		for (const ip of [
			"169.254.169.254",
			"0.0.0.0",
			"100.64.1.1",
			"198.19.0.1",
			"224.0.0.1",
			"::",
			"fe80::1",
		]) {
			await expect(
				resolvePublicTarget(ip, { allowPrivate: true }),
			).rejects.toBeInstanceOf(SsrfBlockedError);
		}
	});

	test("allowPrivate permits RFC1918 and unique-local targets", async () => {
		expect(
			(await resolvePublicTarget("10.0.0.8", { allowPrivate: true })).pinnedIp,
		).toBe("10.0.0.8");
		expect(
			(await resolvePublicTarget("192.168.0.2", { allowPrivate: true }))
				.pinnedIp,
		).toBe("192.168.0.2");
		expect(
			(await resolvePublicTarget("::1", { allowPrivate: true })).pinnedIp,
		).toBe("::1");
	});

	test("strips brackets from literal IPv6 hostnames", async () => {
		const target = await resolvePublicTarget("[::1]", { allowPrivate: true });
		expect(target.pinnedIp).toBe("::1");
		expect(target.family).toBe(6);
	});

	test("prefer IPv4 when allowPrivate resolves dual-stack localhost", async () => {
		const target = await resolvePublicTarget("localhost", {
			allowPrivate: true,
		});
		expect(["127.0.0.1", "::1"]).toContain(target.pinnedIp);
		if (target.allIps.includes("127.0.0.1") && target.allIps.includes("::1")) {
			expect(target.pinnedIp).toBe("127.0.0.1");
			expect(target.family).toBe(4);
		}
	});

	test("public addresses resolve either way", async () => {
		expect((await resolvePublicTarget("1.1.1.1")).pinnedIp).toBe("1.1.1.1");
		expect(
			(await resolvePublicTarget("1.1.1.1", { allowPrivate: true })).pinnedIp,
		).toBe("1.1.1.1");
	});
});
