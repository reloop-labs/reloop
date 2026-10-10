import { describe, expect, test } from "vitest";
import {
	describeCapabilities,
	describeScope,
	parseOAuthAuthorizationRequest,
	redirectHost,
} from "./consent-request";

const QUERY =
	"client_id=https%3A%2F%2Fclient.example.com%2Fmetadata.json" +
	"&redirect_uri=https%3A%2F%2Fclient.example.com%2Fcb" +
	"&response_type=code&scope=openid+profile+email&state=abc123" +
	"&resource=https%3A%2F%2Fapi.example.com%2Fmcp&exp=999&sig=deadbeef";

describe("parseOAuthAuthorizationRequest", () => {
	test("extracts client, scopes, redirect, resources, and raw query", () => {
		const req = parseOAuthAuthorizationRequest(`?${QUERY}`);
		expect(req?.clientId).toBe("https://client.example.com/metadata.json");
		expect(req?.scopes).toEqual(["openid", "profile", "email"]);
		expect(req?.redirectUri).toBe("https://client.example.com/cb");
		expect(req?.resources).toEqual(["https://api.example.com/mcp"]);
		expect(req?.state).toBe("abc123");
		expect(req?.rawQuery).toBe(QUERY);
	});

	test("returns null without client_id or redirect_uri", () => {
		expect(parseOAuthAuthorizationRequest("?scope=openid")).toBeNull();
		expect(parseOAuthAuthorizationRequest("?client_id=x")).toBeNull();
		expect(parseOAuthAuthorizationRequest("")).toBeNull();
	});

	test("empty scope yields an empty list", () => {
		const req = parseOAuthAuthorizationRequest(
			"?client_id=x&redirect_uri=https%3A%2F%2Fx.example%2Fcb",
		);
		expect(req?.scopes).toEqual([]);
	});
});

describe("describeScope", () => {
	test("maps known scopes and prettifies unknown ones", () => {
		expect(describeScope("openid")).toBe("Verify your identity");
		expect(describeScope("mcp:tools")).toBe("mcp tools");
	});
});

describe("redirectHost", () => {
	test("extracts the host and passes through garbage", () => {
		expect(redirectHost("https://client.example.com/cb?x=1")).toBe(
			"client.example.com",
		);
		expect(redirectHost("not a url")).toBe("not a url");
	});
});

describe("describeCapabilities", () => {
	test("an MCP resource lists the Reloop tools plus identity", () => {
		const ids = describeCapabilities({
			scopes: ["openid", "profile", "email", "offline_access"],
			resources: ["https://reloop.sh/mcp"],
		}).map((c) => c.id);
		expect(ids).toEqual(["contacts", "email", "identity", "offline"]);
	});

	test("identity scopes collapse into one line describing what is shared", () => {
		const [identity] = describeCapabilities({
			scopes: ["openid", "email"],
			resources: [],
		});
		expect(identity?.id).toBe("identity");
		expect(identity?.description).toBe("See your email address.");
	});

	test("unknown scopes are still surfaced", () => {
		const ids = describeCapabilities({
			scopes: ["contacts:write"],
			resources: ["https://api.example.com/other"],
		}).map((c) => c.id);
		expect(ids).toEqual(["scope:contacts:write"]);
	});
});
