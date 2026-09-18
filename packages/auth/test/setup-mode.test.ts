import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	adminSetupKeysEqual,
	consumeAdminSetupKeyFile,
	isSetupModeEnabled,
	patchEnvFile,
	readAdminSetupKey,
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

	test("consumeAdminSetupKeyFile removes the file", async () => {
		const dir = await mkdtemp(join(tmpdir(), "reloop-setup-"));
		const path = join(dir, "admin-setup.key");
		await writeFile(path, "secret\n", { mode: 0o600 });
		await consumeAdminSetupKeyFile(path);
		expect(await readAdminSetupKey(path)).toBeNull();
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
});
