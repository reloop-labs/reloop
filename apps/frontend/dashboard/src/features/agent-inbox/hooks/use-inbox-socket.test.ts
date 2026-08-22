import { describe, expect, it } from "vitest";
import { inboxWsUrl } from "./use-inbox-socket";

describe("useInboxSocket", () => {
	it("returns empty string when window is undefined (SSR)", () => {
		const originalWindow = (globalThis as any).window;
		delete (globalThis as any).window;
		expect(inboxWsUrl()).toBe("");
		(globalThis as any).window = originalWindow;
	});

	it("constructs ws url using window location", () => {
		(globalThis as any).window = {
			location: {
				protocol: "https:",
				host: "local.reloop.sh",
			},
		};
		const url = inboxWsUrl();
		expect(url).toBe("wss://local.reloop.sh/api/inbox/v1/ws");

		(globalThis as any).window = {
			location: {
				protocol: "http:",
				host: "localhost:3000",
			},
		};
		expect(inboxWsUrl()).toBe("ws://localhost:3000/api/inbox/v1/ws");
	});
});
