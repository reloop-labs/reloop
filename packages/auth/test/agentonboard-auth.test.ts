import { describe, expect, test } from "bun:test";
import { verifyAgentToken } from "@agentonboard/sdk";
import {
	extractAgentToken,
	resolveAudience,
} from "@reloop/auth/middleware/resolve/resolve-agent-onboard-auth";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { MemoryRedis } from "./memory-redis";

describe("AgentOnboard Auth Resolver", () => {
	const deps: ResolverDeps = {
		baseUrl: "https://reloop.sh",
		redis: new MemoryRedis(),
		ttl: 5,
	};

	test("extractAgentToken extracts Bearer from Authorization header", () => {
		const headers = new Headers({
			authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.xyz",
		});
		expect(extractAgentToken(headers)).toBe(
			"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.xyz",
		);
	});

	test("extractAgentToken extracts from x-agentonboard-token header", () => {
		const headers = new Headers({
			"x-agentonboard-token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.xyz",
		});
		expect(extractAgentToken(headers)).toBe(
			"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.xyz",
		);
	});

	test("extractAgentToken returns null if header is missing or empty", () => {
		expect(extractAgentToken(new Headers())).toBeNull();
		expect(extractAgentToken(new Headers({ authorization: "" }))).toBeNull();
		expect(
			extractAgentToken(new Headers({ authorization: "Bearer " })),
		).toBeNull();
		expect(
			extractAgentToken(new Headers({ authorization: "Bearer" })),
		).toBeNull();
	});

	test("resolveAudience derives bare host from baseUrl or headers", () => {
		expect(resolveAudience(deps)).toBe("reloop.sh");

		const customDeps: ResolverDeps = {
			...deps,
			agentAudience: "custom.domain.com",
		};
		expect(resolveAudience(customDeps)).toBe("custom.domain.com");

		const headerWithHost = new Headers({ host: "api.reloop.local:3000" });
		expect(resolveAudience(deps, headerWithHost)).toBe("api.reloop.local:3000");

		const forwarded = new Headers({ "x-forwarded-host": "reloop.sh" });
		expect(resolveAudience(deps, forwarded)).toBe("reloop.sh");
	});

	test("verifyAgentToken verifies a valid RS256 token against offline JWKS", async () => {
		const { privateKey, publicKey } = await generateKeyPair("RS256");
		const publicJwk = await exportJWK(publicKey);
		publicJwk.kid = "test-key-1";
		publicJwk.alg = "RS256";
		publicJwk.use = "sig";

		const jwks = {
			keys: [publicJwk],
		};

		const now = Math.floor(Date.now() / 1000);
		const token = await new SignJWT({
			email: "agent@example.com",
			sub: "agent@example.com",
		})
			.setProtectedHeader({ alg: "RS256", kid: "test-key-1" })
			.setIssuedAt(now)
			.setExpirationTime(now + 300)
			.setAudience("reloop.sh")
			.setIssuer("https://agentonboard.xyz")
			.setJti("test-jti-123")
			.sign(privateKey);

		const result = await verifyAgentToken({
			token,
			audience: "reloop.sh",
			jwks,
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.email).toBe("agent@example.com");
			expect(result.sub).toBe("agent@example.com");
			expect(result.audience).toBe("reloop.sh");
		}
	});

	test("verifyAgentToken rejects mismatched audience", async () => {
		const { privateKey, publicKey } = await generateKeyPair("RS256");
		const publicJwk = await exportJWK(publicKey);
		publicJwk.kid = "test-key-2";
		publicJwk.alg = "RS256";
		publicJwk.use = "sig";

		const jwks = { keys: [publicJwk] };

		const now = Math.floor(Date.now() / 1000);
		const token = await new SignJWT({
			email: "agent@example.com",
			sub: "agent@example.com",
		})
			.setProtectedHeader({ alg: "RS256", kid: "test-key-2" })
			.setIssuedAt(now)
			.setExpirationTime(now + 300)
			.setAudience("evil.com")
			.setIssuer("https://agentonboard.xyz")
			.setJti("test-jti-456")
			.sign(privateKey);

		const result = await verifyAgentToken({
			token,
			audience: "reloop.sh",
			jwks,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.code).toBe("AUDIENCE_MISMATCH");
		}
	});
});
