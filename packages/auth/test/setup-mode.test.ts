import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	getRuntimeDisableSignup,
	setRuntimeDisableSignup,
} from "@reloop/auth/setup/runtime-registration";
import {
	adminSetupKeysEqual,
	consumeAdminSetupKeyFile,
	isSetupModeEnabled,
	patchEnvFile,
	readAdminSetupKey,
	readEnvFileValue,
	redeemAdminSetupKey,
	seedRuntimeSignupLockFromEnvFile,
} from "@reloop/auth/setup/setup-mode";

describe("setup-mode", () => {
	test("isSetupModeEnabled only accepts true", () => {
		expect(isSetupModeEnabled("true")).toBe(true);
		expect(isSetupModeEnabled("TRUE")).toBe(true);
		expect(isSetupModeEnabled("false")).toBe(false);
		expect(isSetupModeEnabled(undefined)).toBe(false);
	});

	test("adminSetupKeysEqual is exact", () => {
		expect(adminSetupKeysEqual("abc", "abc")).toBe(true);
		expect(adminSetupKeysEqual("abc", "abd")).toBe(false);
		expect(adminSetupKeysEqual("abc", "abcd")).toBe(false);
	});

	test("readAdminSetupKey trims file contents", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		const path = join(dir, "admin-setup.key");
		await writeFile(path, "  secret-key-1\n", { mode: 0o600 });
		expect(await readAdminSetupKey(path)).toBe("secret-key-1");
	});

	test("consumeAdminSetupKeyFile empties the file in place", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		const path = join(dir, "admin-setup.key");
		await writeFile(path, "secret\n", { mode: 0o600 });
		await consumeAdminSetupKeyFile(path);
		expect(await readAdminSetupKey(path)).toBe("");
		expect(await readFile(path, "utf8")).toBe("");
	});

	test("consumeAdminSetupKeyFile tolerates a missing file", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		await consumeAdminSetupKeyFile(join(dir, "admin-setup.key"));
	});

	test("redeemAdminSetupKey spends a matching key under a lock", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		const path = join(dir, "admin-setup.key");
		await writeFile(path, "secret-key-1\n", { mode: 0o600 });

		expect(await redeemAdminSetupKey(path, "secret-key-1")).toEqual({
			status: "redeemed",
			key: "secret-key-1",
		});
		expect(await readAdminSetupKey(path)).toBe("");
		expect(await redeemAdminSetupKey(path, "secret-key-1")).toEqual({
			status: "missing",
		});
	});

	test("redeemAdminSetupKey rejects a wrong key without emptying the file", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		const path = join(dir, "admin-setup.key");
		await writeFile(path, "secret-key-1\n", { mode: 0o600 });

		expect(await redeemAdminSetupKey(path, "secret-key-2")).toEqual({
			status: "invalid",
		});
		expect(await readAdminSetupKey(path)).toBe("secret-key-1");
	});

	test("patchEnvFile updates and inserts keys", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		const path = join(dir, ".env");
		await writeFile(path, "SETUP_MODE=true\nFOO=bar\n", { mode: 0o600 });
		await patchEnvFile(path, {
			SETUP_MODE: "false",
			DISABLE_SIGNUP: "true",
			APP_NAME: "Acme",
		});
		const text = await readFile(path, "utf8");
		expect(text).toContain("SETUP_MODE=false");
		expect(text).toContain("DISABLE_SIGNUP=true");
		expect(text).toContain("APP_NAME=Acme");
		expect(text).toContain("FOO=bar");
	});

	test("patchEnvFile refuses values that could inject another key", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		const path = join(dir, ".env");
		await writeFile(path, "SETUP_MODE=true\n", { mode: 0o600 });

		await expect(
			patchEnvFile(path, { APP_NAME: "Acme\nDISABLE_SIGNUP=false" }),
		).rejects.toThrow("APP_NAME");
		expect(await readFile(path, "utf8")).toBe("SETUP_MODE=true\n");
	});
});

describe("instance env file", () => {
	afterEach(() => {
		setRuntimeDisableSignup(null);
	});

	async function envFile(contents: string): Promise<string> {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		const path = join(dir, ".env");
		await writeFile(path, contents, { mode: 0o600 });
		return path;
	}

	test("readEnvFileValue skips comments and unquotes the last match", async () => {
		const path = await envFile(
			'# DISABLE_SIGNUP=false\nFOO=bar\nDISABLE_SIGNUP="true"\n',
		);

		expect(await readEnvFileValue(path, "DISABLE_SIGNUP")).toBe("true");
		expect(await readEnvFileValue(path, "APP_NAME")).toBeUndefined();
	});

	test("readEnvFileValue tolerates a missing file", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		expect(
			await readEnvFileValue(join(dir, ".env"), "DISABLE_SIGNUP"),
		).toBeUndefined();
	});

	test("boot restores the signup lock written by setup", async () => {
		const path = await envFile("SETUP_MODE=false\nDISABLE_SIGNUP=true\n");

		expect(await seedRuntimeSignupLockFromEnvFile(path)).toBe(true);
		expect(getRuntimeDisableSignup()).toBe(true);
	});

	test("boot leaves the lock untouched when signup stayed open", async () => {
		const path = await envFile("SETUP_MODE=false\nDISABLE_SIGNUP=false\n");

		expect(await seedRuntimeSignupLockFromEnvFile(path)).toBe(false);
		expect(getRuntimeDisableSignup()).toBeNull();
	});

	test("boot leaves the lock untouched when the env file is absent", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));

		expect(await seedRuntimeSignupLockFromEnvFile(join(dir, ".env"))).toBe(
			false,
		);
		expect(getRuntimeDisableSignup()).toBeNull();
	});
});
