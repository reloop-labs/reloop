import { describe, expect, it, mock } from "bun:test";
import {
	checkTemplateSupport,
	fetchDCSettings,
	resolveDCHost,
} from "@reloop/domain/utils/domain-connect-discovery";

// Mock dns resolveTxt for testing resolveDCHost
mock.module("node:dns/promises", () => ({
	resolveTxt: async (hostname: string) => {
		if (hostname === "_domainconnect.example.com") {
			return [["api.domainconnect.godaddy.com"]];
		}
		throw new Error("DNS lookup failed");
	},
}));

describe("Domain Connect Discovery Utility", () => {
	it("resolveDCHost should query dns TXT and return the api host name", async () => {
		const host = await resolveDCHost("example.com");
		expect(host).toBe("api.domainconnect.godaddy.com");
	});

	it("resolveDCHost should return null if dns query fails", async () => {
		const host = await resolveDCHost("invalid-domain.com");
		expect(host).toBeNull();
	});

	it("fetchDCSettings should fetch and parse setting json from provider endpoint", async () => {
		// Mock global fetch
		const mockSettings = {
			providerId: "godaddy.com",
			providerName: "GoDaddy",
			urlSyncUX: "https://connect.godaddy.com",
			urlAPI: "https://api.domainconnect.godaddy.com",
		};

		global.fetch = mock(() =>
			Promise.resolve(
				new Response(JSON.stringify(mockSettings), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		) as any;

		const settings = await fetchDCSettings(
			"api.domainconnect.godaddy.com",
			"example.com",
		);
		expect(settings).not.toBeNull();
		expect(settings?.providerId).toBe("godaddy.com");
		expect(settings?.urlSyncUX).toBe("https://connect.godaddy.com");
	});

	it("checkTemplateSupport should verify if provider returns 200 for template path", async () => {
		global.fetch = mock(() =>
			Promise.resolve(
				new Response("", {
					status: 200,
				}),
			),
		) as any;

		const isSupported = await checkTemplateSupport(
			"https://api.domainconnect.godaddy.com",
			"reloop.sh",
			"email-setup",
		);
		expect(isSupported).toBe(true);
	});
});
