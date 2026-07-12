import { describe, expect, test } from "bun:test";
import { createClient } from "redis";
import { auth } from "../src/lib/auth";

const BASE = "http://localhost/api/auth/v1";

function handle(path: string, init?: RequestInit): Promise<Response> {
	return auth.handler(new Request(`${BASE}${path}`, init));
}

function cookieHeader(res: Response): string {
	return res.headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
}

function sessionToken(cookie: string): string {
	const match = cookie.match(/reloop\.session_token=([^.;]+)\./);
	if (!match?.[1]) throw new Error(`No session token in cookie: ${cookie}`);
	return match[1];
}

async function signUp(): Promise<{
	email: string;
	cookie: string;
	token: string;
}> {
	const email = `user-${crypto.randomUUID()}@example.com`;
	const res = await handle("/sign-up/email", {
		method: "POST",
		headers: { "content-type": "application/json", origin: "http://localhost" },
		body: JSON.stringify({
			email,
			password: "password12345",
			name: "Test User",
		}),
	});
	expect(res.status).toBe(200);
	const cookie = cookieHeader(res);
	expect(cookie).toContain("reloop.session_token");
	return { email, cookie, token: sessionToken(cookie) };
}

/** Force a session stored in Redis (secondaryStorage) to be expired. */
async function expireSession(token: string): Promise<void> {
	const client = createClient({ url: process.env.REDIS_URL });
	await client.connect();
	try {
		const key = `auth:${token}`;
		const raw = await client.get(key);
		if (!raw) throw new Error(`No stored session for token ${token}`);
		const parsed = JSON.parse(raw);
		const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
		parsed.session.expiresAt = past;
		await client.set(key, JSON.stringify(parsed));
	} finally {
		await client.quit();
	}
}

describe("get-session characterization", () => {
	test("valid session returns the user", async () => {
		const { email, cookie } = await signUp();

		const res = await handle("/get-session", {
			method: "GET",
			headers: { cookie },
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as { user?: { email?: string } } | null;
		expect(body?.user?.email).toBe(email);
	});

	test("absent/invalid session returns no session", async () => {
		const res = await handle("/get-session", { method: "GET" });
		expect(res.status).toBe(200);
		expect(await res.json()).toBeNull();

		const garbage = await handle("/get-session", {
			method: "GET",
			headers: { cookie: "reloop.session_token=not-a-real-token.badsig" },
		});
		expect(garbage.status).toBe(200);
		expect(await garbage.json()).toBeNull();
	});

	test("expired session returns no session", async () => {
		const { cookie, token } = await signUp();

		// Sanity: the session is valid before we expire it.
		const before = await handle("/get-session", {
			method: "GET",
			headers: { cookie },
		});
		expect(await before.json()).not.toBeNull();

		await expireSession(token);

		const after = await handle("/get-session", {
			method: "GET",
			headers: { cookie },
		});
		expect(after.status).toBe(200);
		expect(await after.json()).toBeNull();
	});
});
