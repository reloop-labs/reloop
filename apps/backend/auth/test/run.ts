import { join } from "node:path";
import { startEphemeralStack } from "./harness/containers";

/**
 * Test orchestrator: brings up an ephemeral Postgres + Redis stack, injects the
 * connection strings into the environment, runs `bun test`, and guarantees the
 * containers are torn down afterwards (even on failure or interrupt).
 *
 * Usage:
 *   bun run test              # run every characterization test
 *   bun run test <file...>    # run specific test file(s)
 */
const testArgs = process.argv.slice(2);

const stack = await startEphemeralStack();

let interrupted = false;
const onSignal = async () => {
	interrupted = true;
	await stack.teardown();
	process.exit(130);
};
process.on("SIGINT", onSignal);
process.on("SIGTERM", onSignal);

let exitCode = 1;
try {
	const proc = Bun.spawn(
		["bun", "test", ...(testArgs.length > 0 ? testArgs : ["test/"])],
		{
			cwd: join(import.meta.dir, ".."),
			env: {
				...process.env,
				PG_URL: stack.pgUrl,
				REDIS_URL: stack.redisUrl,
				BETTER_AUTH_SECRET:
					process.env.BETTER_AUTH_SECRET ?? "test-secret-characterization",
				NODE_ENV: "test",
				DISABLE_SIGNUP: "false",
			},
			stdio: ["inherit", "inherit", "inherit"],
		},
	);
	exitCode = await proc.exited;
} finally {
	if (!interrupted) await stack.teardown();
}

process.exit(exitCode);
