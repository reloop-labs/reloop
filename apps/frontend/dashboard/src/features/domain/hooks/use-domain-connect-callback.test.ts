import { describe, expect, it } from "vitest";
import { consumeDomainConnectCallback } from "./use-domain-connect-callback";

describe("consumeDomainConnectCallback", () => {
	it("preserves unrelated URL state and removes only callback keys", () => {
		expect(
			consumeDomainConnectCallback(
				"tab=dns&dc_status=success&dc_error=stale&page=2",
			),
		).toEqual({
			status: "success",
			error: "stale",
			nextSearch: "tab=dns&page=2",
		});
	});

	it("preserves provider error strings without coercion", () => {
		expect(
			consumeDomainConnectCallback(
				"dc_status=error&dc_error=001234%20provider%20failure",
			),
		).toEqual({
			status: "error",
			error: "001234 provider failure",
			nextSearch: "",
		});
	});

	it("ignores URLs that are not Domain Connect callbacks", () => {
		expect(consumeDomainConnectCallback("tab=configuration")).toBeNull();
	});
});
