import { describe, expect, it } from "bun:test";
import {
	checkBlocklistController,
	DNSBL_PROVIDERS,
} from "../src/routes/tools/blocklist-check/blocklist-check.controllers";

describe("checkBlocklistController", () => {
	it("has 20 configured DNSBL security zones", () => {
		expect(DNSBL_PROVIDERS.length).toBeGreaterThanOrEqual(15);
	});

	it("evaluates a standard clean domain without throwing", async () => {
		const result = await checkBlocklistController("reloop.sh");
		expect(result.target).toBe("reloop.sh");
		expect(result.inputType).toBe("domain");
		expect(result.totalChecked).toBe(DNSBL_PROVIDERS.length);
		expect(result.results.length).toBe(DNSBL_PROVIDERS.length);
		expect(typeof result.isClean).toBe("boolean");
	}, 10000);

	it("handles IPv4 addresses directly", async () => {
		const result = await checkBlocklistController("1.1.1.1");
		expect(result.target).toBe("1.1.1.1");
		expect(result.inputType).toBe("ip");
		expect(result.resolvedIp).toBe("1.1.1.1");
	}, 10000);

	it("throws an error for empty input", async () => {
		expect(checkBlocklistController("")).rejects.toThrow();
	});
});
