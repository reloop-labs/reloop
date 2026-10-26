import { describe, expect, test } from "bun:test";
import {
	classifyClick,
	classifyOpen,
	clientIpFrom,
	engagementContext,
	rawRequest,
} from "@reloop/be-mail/lib/engagement-context";

const UA = {
	gmail:
		"Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via ggpht.com GoogleImageProxy)",
	yahoo:
		"YahooMailProxy; https://help.yahoo.com/kb/yahoo-mail-proxy-SLN28749.html",
	appleMpp: "Mozilla/5.0",
	appleMailMac:
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko)",
	appleMailIphone:
		"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
	outlookDesktop:
		"Mozilla/4.0 (compatible; ms-office; MSOffice 16) Microsoft Outlook 16.0.17531; Pro",
	thunderbird:
		"Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Thunderbird/128.3.0",
	chromeMac:
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
	safariIphone:
		"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
	mimecast: "Mimecast Security Scanner",
	curl: "curl/8.7.1",
};

describe("classifyOpen", () => {
	test("Gmail and Yahoo opens come through their image proxies", () => {
		expect(classifyOpen(UA.gmail)).toMatchObject({
			client: "Gmail",
			proxied: true,
			machine: false,
			device: null,
		});
		expect(classifyOpen(UA.yahoo)).toMatchObject({
			client: "Yahoo Mail",
			proxied: true,
		});
	});

	test("Apple Mail Privacy Protection prefetch is a machine open", () => {
		expect(classifyOpen(UA.appleMpp)).toMatchObject({
			client: "Apple Mail",
			machine: true,
			machineReason: "apple_privacy",
		});
	});

	test("Apple Mail without privacy protection is a real open with a device", () => {
		expect(classifyOpen(UA.appleMailMac)).toMatchObject({
			client: "Apple Mail",
			machine: false,
			device: "desktop",
			os: "macOS",
		});
		expect(classifyOpen(UA.appleMailIphone)).toMatchObject({
			client: "Apple Mail",
			device: "mobile",
			os: "iOS",
		});
	});

	test("desktop clients are named", () => {
		expect(classifyOpen(UA.outlookDesktop)).toMatchObject({
			client: "Outlook",
			machine: false,
		});
		expect(classifyOpen(UA.thunderbird)).toMatchObject({
			client: "Thunderbird",
			os: "Linux",
		});
	});

	test("a browser loading the pixel is webmail", () => {
		expect(classifyOpen(UA.chromeMac)).toMatchObject({
			client: "Webmail",
			browser: "Chrome",
			device: "desktop",
		});
	});

	test("scanners and empty agents are machine opens", () => {
		for (const ua of [UA.mimecast, UA.curl, "", null]) {
			expect(classifyOpen(ua)).toMatchObject({
				machine: true,
				machineReason: "security_scanner",
			});
		}
	});
});

describe("classifyClick", () => {
	test("reads the reader's browser and device", () => {
		expect(classifyClick(UA.safariIphone)).toMatchObject({
			browser: "Mobile Safari",
			device: "mobile",
			os: "iOS",
			machine: false,
		});
	});

	test("link scanners are flagged", () => {
		expect(classifyClick(UA.mimecast).machine).toBe(true);
	});
});

describe("clientIpFrom", () => {
	test("prefers the proxy's X-Forwarded-For entry", () => {
		const headers = new Headers({
			"x-forwarded-for": "203.0.113.9, 10.0.0.2",
			"cf-connecting-ip": "198.51.100.1",
		});
		expect(clientIpFrom(headers, "10.0.0.2")).toBe("203.0.113.9");
	});

	test("ignores garbage and falls back to the socket", () => {
		const headers = new Headers({ "x-forwarded-for": "not-an-ip" });
		expect(clientIpFrom(headers, "192.0.2.4")).toBe("192.0.2.4");
	});
});

describe("engagementContext", () => {
	test("parsed fields skip geo for proxies and leave the IP to the raw columns", async () => {
		const ctx = await engagementContext({
			kind: "open",
			headers: new Headers({
				"user-agent": UA.gmail,
				"x-forwarded-for": "203.0.113.9",
			}),
			socketIp: null,
		});
		expect(ctx).toMatchObject({ client: "Gmail", country: null, city: null });
		expect(JSON.stringify(ctx)).not.toContain("203.0.113.9");
	});
});

describe("rawRequest", () => {
	test("keeps every header and the client IP, minus credentials", () => {
		const raw = rawRequest(
			new Headers({
				"User-Agent": UA.outlookDesktop,
				"Accept-Language": "de-DE",
				"X-Forwarded-For": "203.0.113.9",
				Cookie: "session=secret",
				Authorization: "Bearer rl_secret",
			}),
			"10.0.0.2",
		);
		expect(raw.clientIp).toBe("203.0.113.9");
		expect(raw.requestHeaders).toMatchObject({
			"user-agent": UA.outlookDesktop,
			"accept-language": "de-DE",
			"x-forwarded-for": "203.0.113.9",
		});
		expect(raw.requestHeaders.cookie).toBeUndefined();
		expect(raw.requestHeaders.authorization).toBeUndefined();
	});
});
