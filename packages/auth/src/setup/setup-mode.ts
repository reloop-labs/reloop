import { timingSafeEqual } from "node:crypto";
import { readFile, truncate, writeFile } from "node:fs/promises";
import { isEnvFlagEnabled } from "../registration-controls";

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

export async function patchEnvFile(
	filePath: string,
	updates: Record<string, string>,
): Promise<void> {
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
