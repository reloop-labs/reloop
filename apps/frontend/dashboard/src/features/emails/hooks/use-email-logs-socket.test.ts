import { describe, expect, it } from "vitest";
import { emailLogsWsUrl } from "./use-email-logs-socket";

describe("useEmailLogsSocket", () => {
	it("returns empty string when window is undefined (SSR)", () => {
		const originalWindow = (globalThis as { window?: unknown }).window;
		delete (globalThis as { window?: unknown }).window;
		expect(emailLogsWsUrl()).toBe("");
		(globalThis as { window?: unknown }).window = originalWindow;
	});

	it("constructs ws url using window location", () => {
		(globalThis as { window?: unknown }).window = {
			location: {
				protocol: "https:",
				host: "local.reloop.sh",
			},
		};
		expect(emailLogsWsUrl()).toBe("wss://local.reloop.sh/api/logs/v1/ws");

		(globalThis as { window?: unknown }).window = {
			location: {
				protocol: "http:",
				host: "localhost:3000",
			},
		};
		expect(emailLogsWsUrl()).toBe("ws://localhost:3000/api/logs/v1/ws");
	});
});
