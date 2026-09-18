import { describe, expect, test } from "bun:test";
import {
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

	test("public addresses resolve either way", async () => {
		expect((await resolvePublicTarget("1.1.1.1")).pinnedIp).toBe("1.1.1.1");
		expect(
			(await resolvePublicTarget("1.1.1.1", { allowPrivate: true })).pinnedIp,
		).toBe("1.1.1.1");
	});
});
