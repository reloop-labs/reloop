import { readFile } from "node:fs/promises";
import {
	requireUserAgentPlugin,
	secureHeadersPlugin,
} from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { auth } from "../../src/lib/auth";
import { setupRoutes } from "../../src/routes/setup/setup.route";

const ORIGIN = "http://localhost";

const app = new Elysia({ prefix: "/api/auth" })
	.use(secureHeadersPlugin({ profile: "api" }))
	.use(requireUserAgentPlugin())
	.use(setupRoutes)
	.mount("/", auth.handler);

type Check = {
	status: number;
	body: unknown;
	setCookie: string[];
};

async function call(
	method: string,
	path: string,
	body?: unknown,
): Promise<Check> {
	const res = await app.handle(
		new Request(`${ORIGIN}${path}`, {
			method,
			headers: {
				"content-type": "application/json",
				origin: ORIGIN,
				"user-agent": "reloop-setup-probe/1.0",
			},
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
	);

	const text = await res.text();
	let parsed: unknown = null;
	if (text) {
		try {
			parsed = JSON.parse(text);
		} catch {
			parsed = text;
		}
	}

	return {
		status: res.status,
		body: parsed,
		setCookie: res.headers.getSetCookie(),
	};
}

const STATUS_PATH = "/api/auth/v1/setup/status";
const COMPLETE_PATH = "/api/auth/v1/setup/complete";

const account = {
	name: "Probe Admin",
	email: "admin@probe.test",
	password: "password12345",
	disableSignup: true,
	organizationName: "Probe Org",
	appName: "Probe Corp",
};

const keyFile = process.env.ADMIN_SETUP_KEY_FILE as string;
const envFile = process.env.RELOOP_ENV_FILE as string;

const checks: Record<string, Check> = {};
let files: { key: string; env: string } | null = null;

if (process.env.PROBE_CASE === "off") {
	checks.status = await call("GET", STATUS_PATH);
	checks.complete = await call("POST", COMPLETE_PATH, {
		...account,
		adminKey: "any-key",
	});
	checks.completeInvalidBody = await call("POST", COMPLETE_PATH, {});
} else {
	const adminKey = (await readFile(keyFile, "utf8")).trim();

	checks.betterAuthOk = await call("GET", "/api/auth/v1/ok");
	checks.status = await call("GET", STATUS_PATH);
	checks.completeInvalidBody = await call("POST", COMPLETE_PATH, {});
	checks.completeWrongKey = await call("POST", COMPLETE_PATH, {
		...account,
		adminKey: "wrong-setup-key",
	});
	checks.complete = await call("POST", COMPLETE_PATH, { ...account, adminKey });
	checks.statusAfter = await call("GET", STATUS_PATH);
	checks.completeAgain = await call("POST", COMPLETE_PATH, {
		...account,
		adminKey,
	});
	checks.publicSignUpAfter = await call("POST", "/api/auth/v1/sign-up/email", {
		name: "Stranger",
		email: "stranger@probe.test",
		password: "password12345",
	});

	files = {
		key: await readFile(keyFile, "utf8"),
		env: await readFile(envFile, "utf8"),
	};
}

console.log(JSON.stringify({ checks, files }));
process.exit(0);
