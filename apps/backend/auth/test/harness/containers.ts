import { join } from "node:path";
import { $ } from "bun";

/**
 * Ephemeral Postgres + Redis stack for the auth characterization tests.
 *
 * Spins up throwaway containers on random host ports (so they never clash with
 * the local dev stack on 5432/6379), waits for readiness, and pushes the current
 * Drizzle schema. Everything is torn down again via {@link EphemeralStack.teardown}.
 */
export type EphemeralStack = {
	pgUrl: string;
	redisUrl: string;
	teardown: () => Promise<void>;
};

const PG_IMAGE = "postgres:17-alpine";
const REDIS_IMAGE = "redis:7-alpine";
const PG_USER = "reloop";
const PG_PASSWORD = "reloop123";
const PG_DB = "reloop_test";
const REDIS_PASSWORD = "reloop123";

const REPO_ROOT = join(import.meta.dir, "..", "..", "..", "..", "..");
const DB_DIR = join(REPO_ROOT, "packages", "db");

const runId = `${process.pid}-${Date.now()}`;
const PG_NAME = `reloop-test-pg-${runId}`;
const REDIS_NAME = `reloop-test-redis-${runId}`;

async function resolveHostPort(
	container: string,
	internalPort: number,
): Promise<number> {
	const raw = (await $`docker port ${container} ${internalPort}`.text()).trim();
	// e.g. "127.0.0.1:55432" (may contain both v4 and v6 lines)
	const line = raw.split("\n")[0] ?? "";
	const port = line.split(":").pop();
	if (!port) throw new Error(`Could not resolve host port from: ${raw}`);
	return Number(port);
}

async function waitFor(
	label: string,
	check: () => Promise<boolean>,
	timeoutMs = 60_000,
): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (await check()) return;
		await Bun.sleep(500);
	}
	throw new Error(`Timed out waiting for ${label} to become ready`);
}

async function removeContainers(): Promise<void> {
	await $`docker rm -f ${PG_NAME} ${REDIS_NAME}`.quiet().nothrow();
}

export async function startEphemeralStack(): Promise<EphemeralStack> {
	// Clean up any stragglers from a previous crashed run with the same names.
	await removeContainers();

	const pgEnv = [
		"-e",
		`POSTGRES_USER=${PG_USER}`,
		"-e",
		`POSTGRES_PASSWORD=${PG_PASSWORD}`,
		"-e",
		`POSTGRES_DB=${PG_DB}`,
	];
	await $`docker run -d --name ${PG_NAME} -p 127.0.0.1::5432 ${pgEnv} ${PG_IMAGE}`.quiet();

	await $`docker run -d --name ${REDIS_NAME} -p 127.0.0.1::6379 ${REDIS_IMAGE} redis-server --requirepass ${REDIS_PASSWORD}`.quiet();

	const teardown = async () => {
		await removeContainers();
	};

	try {
		const pgPort = await resolveHostPort(PG_NAME, 5432);
		const redisPort = await resolveHostPort(REDIS_NAME, 6379);

		const pgUrl = `postgresql://${PG_USER}:${PG_PASSWORD}@127.0.0.1:${pgPort}/${PG_DB}`;
		const redisUrl = `redis://:${REDIS_PASSWORD}@127.0.0.1:${redisPort}`;

		await waitFor("postgres", async () => {
			const res =
				await $`docker exec ${PG_NAME} pg_isready -U ${PG_USER} -d ${PG_DB}`
					.quiet()
					.nothrow();
			return res.exitCode === 0;
		});

		await waitFor("redis", async () => {
			const res =
				await $`docker exec ${REDIS_NAME} redis-cli -a ${REDIS_PASSWORD} ping`
					.quiet()
					.nothrow();
			return res.stdout.toString().includes("PONG");
		});

		// Apply the full current schema to the empty database.
		await $`bunx drizzle-kit push --force`
			.cwd(DB_DIR)
			.env({ ...process.env, PG_URL: pgUrl })
			.quiet();

		return { pgUrl, redisUrl, teardown };
	} catch (err) {
		await teardown();
		throw err;
	}
}
