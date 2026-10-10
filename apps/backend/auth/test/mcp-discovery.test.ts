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
	test("authorization-server metadata advertises CIMD and open DCR", async () => {
		const res = await handle(
			`${ISSUER}/.well-known/oauth-authorization-server`,
		);
		expect(res.status).toBe(200);
		const meta = (await res.json()) as Record<string, unknown>;
		expect(meta.issuer).toBe(ISSUER);
		expect(meta.client_id_metadata_document_supported).toBe(true);
		expect(meta.registration_endpoint).toBe(`${ISSUER}/oauth2/register`);
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

	test("an unauthenticated client can register dynamically", async () => {
		const res = await auth.handler(
			new Request(`${ISSUER}/oauth2/register`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					client_name: "DCR test client",
					redirect_uris: ["http://127.0.0.1:33418/callback"],
					grant_types: ["authorization_code", "refresh_token"],
					response_types: ["code"],
					token_endpoint_auth_method: "none",
				}),
			}),
		);
		if (res.status >= 300)
			console.log("DCR", res.status, await res.clone().text());
		expect(res.status).toBeLessThan(300);
		const client = (await res.json()) as { client_id?: string };
		expect(client.client_id).toBeTruthy();
	});

	test("desktop MCP clients register with loopback or custom-scheme redirects", async () => {
		for (const [redirectUri, applicationType] of [
			["http://localhost:33418/callback", undefined],
			["cursor://anysphere.cursor-mcp/oauth/callback", undefined],
			["cursor://anysphere.cursor-mcp/oauth/callback", "web"],
		]) {
			const res = await auth.handler(
				new Request(`${ISSUER}/oauth2/register`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						client_name: "Desktop MCP client",
						application_type: applicationType,
						redirect_uris: [redirectUri],
						token_endpoint_auth_method: "none",
					}),
				}),
			);
			expect(res.status).toBeLessThan(300);
			const client = (await res.json()) as { application_type?: string };
			expect(client.application_type).toBe("native");
		}
	});

	test("dangerous or non-https web redirects are still rejected", async () => {
		for (const redirectUri of [
			"javascript://x/%0aalert(1)",
			"http://evil.example/callback",
		]) {
			const res = await auth.handler(
				new Request(`${ISSUER}/oauth2/register`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						client_name: "Rejected client",
						redirect_uris: [redirectUri],
						token_endpoint_auth_method: "none",
					}),
				}),
			);
			expect(res.status).toBe(400);
		}
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
