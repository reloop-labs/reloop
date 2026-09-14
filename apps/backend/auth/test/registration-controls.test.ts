import { beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";

const PROBE = join(import.meta.dir, "harness", "registration-probe.ts");
const DEFAULT_OTP = "424242";

async function probe(
	mode: "seed" | "check",
	flags: Record<string, string> = {},
): Promise<Record<string, number>> {
	const proc = Bun.spawn(["bun", "run", PROBE], {
		cwd: join(import.meta.dir, ".."),
		env: {
			...process.env,
			PROBE_MODE: mode,
			DEFAULT_OTP,
			...flags,
		},
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
		throw new Error(`probe ${mode} failed (exit ${code}): ${stderr || stdout}`);
	}
	return JSON.parse(line);
}

describe("registration controls", () => {
	let open: Record<string, number>;
	let closed: Record<string, number>;
	let lockedDown: Record<string, number>;

	beforeAll(async () => {
		open = await probe("seed", { DISABLE_SIGNUP: "false" });
		closed = await probe("check", { DISABLE_SIGNUP: "true" });
		lockedDown = await probe("check", {
			DISABLE_SIGNUP: "true",
			DISABLE_ORG_CREATION: "true",
		});
	});

	test("registration is open by default", () => {
		expect(open.ownerSignUp).toBe(200);
		expect(open.memberSignUp).toBe(200);
	});

	test("DISABLE_SIGNUP blocks password sign-up", () => {
		expect(closed.strangerPassword).toBe(403);
	});

	test("DISABLE_SIGNUP blocks email OTP sign-up", () => {
		expect(closed.strangerOtp).toBe(403);
	});

	test("existing users can still sign in", () => {
		expect(closed.existingUserSignIn).toBe(200);
	});

	test("a pending invitation still allows sign-up", () => {
		expect(closed.pendingInvite).toBe(200);
	});

	test("an expired invitation does not allow sign-up", () => {
		expect(closed.expiredInvite).toBe(403);
	});

	test("organization creation stays open unless disabled", () => {
		expect(closed.organizationCreate).toBe(200);
	});

	test("DISABLE_ORG_CREATION blocks organization creation", () => {
		expect(lockedDown.organizationCreate).toBe(403);
	});
});
