import { describe, expect, test } from "bun:test";
import { authServerConfig } from "@reloop/auth/server/config";
import { auth } from "../src/lib/auth";
import {
	handleOAuthDiscovery,
	oauthDiscoveryPath,
} from "../src/routes/discovery/oauth-discovery";

const ISSUER = `${authServerConfig.BASE_URL}/api/auth/v1`;
const RESOURCE = authServerConfig.MCP_RESOURCE;

function handle(url: string): Promise<Response> {
	return auth.handler(new Request(url));
}

describe("mcp authorization-server discovery", () => {
	test("authorization-server metadata advertises CIMD without DCR", async () => {
		const res = await handle(
			`${ISSUER}/.well-known/oauth-authorization-server`,
		);
		expect(res.status).toBe(200);
		const meta = (await res.json()) as Record<string, unknown>;
		expect(meta.issuer).toBe(ISSUER);
		expect(meta.client_id_metadata_document_supported).toBe(true);
		// DCR stays disabled (MCP deprecates it): no registration endpoint.
		expect(meta.registration_endpoint).toBeUndefined();
	});

	test("protected-resource metadata binds the configured MCP resource", async () => {
		const resourcePath = new URL(RESOURCE).pathname || "/";
		const res = await handle(
			`${authServerConfig.BASE_URL}/.well-known/oauth-protected-resource${resourcePath}`,
		);
		expect(res.status).toBe(200);
		const meta = (await res.json()) as {
			resource?: string;
			authorization_servers?: string[];
		};
		expect(meta.resource).toBe(RESOURCE);
		expect(meta.authorization_servers).toContain(ISSUER);
	});

	test("userinfo without a token is rejected, not misrouted", async () => {
		const res = await handle(`${ISSUER}/oauth2/userinfo`);
		expect(res.status).toBe(401);
	});
});

describe("root-level oauth discovery", () => {
	test("maps root and path-inserted discovery URLs to the issuer document", () => {
		expect(oauthDiscoveryPath("/.well-known/oauth-authorization-server")).toBe(
			"/api/auth/v1/.well-known/oauth-authorization-server",
		);
		expect(
			oauthDiscoveryPath("/.well-known/oauth-authorization-server/api/auth/v1"),
		).toBe("/api/auth/v1/.well-known/oauth-authorization-server");
		expect(
			oauthDiscoveryPath("/.well-known/openid-configuration/api/auth/v1"),
		).toBe("/api/auth/v1/.well-known/openid-configuration");
		expect(
			oauthDiscoveryPath("/.well-known/oauth-authorization-server/other"),
		).toBeNull();
		expect(oauthDiscoveryPath("/api/auth/v1/session")).toBeNull();
	});

	test("serves issuer metadata at the path-inserted URL", async () => {
		const res = await handleOAuthDiscovery(
			new Request(
				`${authServerConfig.BASE_URL}/.well-known/oauth-authorization-server/api/auth/v1`,
			),
		);
		expect(res?.status).toBe(200);
		const meta = (await res?.json()) as Record<string, unknown>;
		expect(meta.issuer).toBe(ISSUER);
	});
});
