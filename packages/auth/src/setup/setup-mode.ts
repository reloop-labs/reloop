import { timingSafeEqual } from "node:crypto";
import { readFile, truncate, writeFile } from "node:fs/promises";
import { isEnvFlagEnabled } from "../registration-controls";
import { setRuntimeDisableSignup } from "./runtime-registration";
import { isSafeEnvText } from "./setup-limits";

export function isSetupModeEnabled(value: string | undefined): boolean {
	return isEnvFlagEnabled(value);
}

export async function readAdminSetupKey(
	filePath: string,
): Promise<string | null> {
	try {
		return (await readFile(filePath, "utf8")).trim();
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
		throw error;
	}
}

export function adminSetupKeysEqual(
	presented: string,
	expected: string,
): boolean {
	const presentedBuffer = Buffer.from(presented);
	const expectedBuffer = Buffer.from(expected);

	if (presentedBuffer.length !== expectedBuffer.length) return false;

	return timingSafeEqual(presentedBuffer, expectedBuffer);
}

export async function consumeAdminSetupKeyFile(
	filePath: string,
): Promise<void> {
	try {
		await truncate(filePath, 0);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
	}
}

export async function readEnvFileValue(
	filePath: string,
	key: string,
): Promise<string | undefined> {
	let text: string;
	try {
		text = await readFile(filePath, "utf8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
		throw error;
	}

	let found: string | undefined;
	for (const line of text.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const separatorIndex = trimmed.indexOf("=");
		if (separatorIndex === -1) continue;
		if (trimmed.slice(0, separatorIndex).trim() !== key) continue;

		found = trimmed
			.slice(separatorIndex + 1)
			.trim()
			.replace(/^(["'])(.*)\1$/, "$2");
	}

	return found;
}

/**
 * Restores the signup lock that setup wrote to the mounted `.env`. The runtime
 * lock lives in memory, so without this a container restart would reopen public
 * registration on an instance whose operator closed it.
 */
export async function seedRuntimeSignupLockFromEnvFile(
	filePath: string,
): Promise<boolean> {
	const value = await readEnvFileValue(filePath, "DISABLE_SIGNUP");
	if (!isEnvFlagEnabled(value)) return false;

	setRuntimeDisableSignup(true);
	return true;
}

export async function patchEnvFile(
	filePath: string,
	updates: Record<string, string>,
): Promise<void> {
	for (const [key, value] of Object.entries(updates)) {
		if (!isSafeEnvText(key) || !isSafeEnvText(value)) {
			throw new Error(`Refusing to write an unsafe value for ${key}`);
		}
	}

	const text = await readFile(filePath, "utf8");
	const lines = text.split("\n");
	const remainingUpdates = new Map(Object.entries(updates));
	const patchedLines = lines.map((line) => {
		const separatorIndex = line.indexOf("=");
		if (separatorIndex === -1) return line;

		const key = line.slice(0, separatorIndex);
		const value = remainingUpdates.get(key);
		if (value === undefined) return line;

		remainingUpdates.delete(key);
		return `${key}=${value}`;
	});

	if (patchedLines.at(-1) === "") patchedLines.pop();

	for (const [key, value] of remainingUpdates) {
		patchedLines.push(`${key}=${value}`);
	}

	await writeFile(filePath, `${patchedLines.join("\n")}\n`);
}
