import { beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";
import { Client } from "pg";

const PROBE = join(import.meta.dir, "harness", "setup-probe.ts");
const APP_DIR = join(import.meta.dir, "..");
const DB_DIR = join(import.meta.dir, "..", "..", "..", "..", "packages", "db");
const ADMIN_KEY = "5f2b8c1d4e6a7908b3c2d1e0f9a8b7c6";

type Check = {
	status: number;
	body: Record<string, unknown> | null;
	setCookie: string[];
};

type ProbeOutput = {
	checks: Record<string, Check>;
	files: { key: string; env: string } | null;
};

async function isolatedDatabaseUrl(): Promise<string> {
	const base = process.env.PG_URL;
	if (!base)
		throw new Error("PG_URL is not set; run this suite via `bun run test`");

	const name = `reloop_setup_${process.pid}_${Date.now()}`;
	const adminUrl = new URL(base);
	adminUrl.pathname = "/postgres";

	const admin = new Client({ connectionString: adminUrl.toString() });
	await admin.connect();
	try {
		await admin.query(`CREATE DATABASE "${name}"`);
	} finally {
		await admin.end();
	}

	const dbUrl = new URL(base);
	dbUrl.pathname = `/${name}`;
	const url = dbUrl.toString();

	await $`bunx drizzle-kit push --force`
		.cwd(DB_DIR)
		.env({ ...process.env, PG_URL: url })
		.quiet();

	return url;
}

async function instanceFiles(): Promise<{ keyFile: string; envFile: string }> {
	const dir = await mkdtemp(join(tmpdir(), "reloop-setup-probe-"));
	const keyFile = join(dir, "admin-setup.key");
	const envFile = join(dir, ".env");
	await writeFile(keyFile, `${ADMIN_KEY}\n`);
	await writeFile(envFile, "SETUP_MODE=true\nDISABLE_SIGNUP=false\n");
	return { keyFile, envFile };
}

async function probe(env: Record<string, string>): Promise<ProbeOutput> {
	const proc = Bun.spawn(["bun", "run", PROBE], {
		cwd: APP_DIR,
		env: { ...process.env, ...env },
		stdout: "pipe",
		stderr: "pipe",
	});

	const [stdout, stderr, code] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);

	const line = stdout.trim().split("\n").at(-1) ?? "";
	if (code !== 0 || !line.startsWith("{")) {
		throw new Error(`setup probe failed (exit ${code}): ${stderr || stdout}`);
	}
	return JSON.parse(line);
}

describe("self-host setup routes", () => {
	let off: ProbeOutput;
	let flow: ProbeOutput;

	beforeAll(async () => {
		const pgUrl = await isolatedDatabaseUrl();

		const offFiles = await instanceFiles();
		off = await probe({
			PG_URL: pgUrl,
			PROBE_CASE: "off",
			ADMIN_SETUP_KEY_FILE: offFiles.keyFile,
			RELOOP_ENV_FILE: offFiles.envFile,
		});

		const flowFiles = await instanceFiles();
		flow = await probe({
			PG_URL: pgUrl,
			PROBE_CASE: "flow",
			SETUP_MODE: "true",
			ADMIN_SETUP_KEY_FILE: flowFiles.keyFile,
			RELOOP_ENV_FILE: flowFiles.envFile,
		});
	});

	test("status is 404 when setup mode is off", () => {
		expect(off.checks.status?.status).toBe(404);
	});

	test("complete is 404 when setup mode is off", () => {
		expect(off.checks.complete?.status).toBe(404);
		expect(off.checks.completeInvalidBody?.status).toBe(404);
	});

	test("better auth stays reachable on the same base path", () => {
		expect(flow.checks.betterAuthOk?.status).toBe(200);
	});

	test("status reports setup as required on an empty instance", () => {
		expect(flow.checks.status?.status).toBe(200);
		expect(flow.checks.status?.body).toEqual({
			required: true,
			reason: "ready",
		});
	});

	test("a malformed body is rejected with 400", () => {
		expect(flow.checks.completeInvalidBody?.status).toBe(400);
	});

	test("a wrong admin key is rejected with a generic 403", () => {
		expect(flow.checks.completeWrongKey?.status).toBe(403);
		expect(flow.checks.completeWrongKey?.body).toEqual({
			message: "Invalid setup key",
		});
	});

	test("completing setup creates a signed-in super-admin", () => {
		const complete = flow.checks.complete;
		expect(complete?.status).toBe(200);
		expect(complete?.body).toMatchObject({
			user: { email: "admin@probe.test", role: "super-admin" },
		});
		expect(complete?.body?.organizationId).toBeString();
		expect(complete?.setCookie.join("; ")).toContain("reloop.session_token");
	});

	test("setup cannot be completed twice", () => {
		expect(flow.checks.statusAfter?.status).toBe(404);
		expect(flow.checks.completeAgain?.status).toBe(404);
	});

	test("the signup lock applies immediately after setup", () => {
		expect(flow.checks.publicSignUpAfter?.status).toBe(403);
	});

	test("the admin key is emptied and the env file is rewritten", () => {
		expect(flow.files?.key.trim()).toBe("");
		expect(flow.files?.env).toContain("SETUP_MODE=false");
		expect(flow.files?.env).toContain("DISABLE_SIGNUP=true");
		expect(flow.files?.env).toContain("APP_NAME=Probe Corp");
	});
});
