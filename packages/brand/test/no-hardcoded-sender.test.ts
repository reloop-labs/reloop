import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DEFAULT_APP_NAME } from "@reloop/brand";
import { Glob } from "bun";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

const SCANNED_ROOTS = ["apps/backend", "packages"];

const SKIPPED = [
	"/node_modules/",
	"/dist/",
	"/.turbo/",
	"/packages/code-samples/",
	".test.ts",
];

const HARDCODED_SENDER = new RegExp(
	`["\`]${DEFAULT_APP_NAME}(\\s+[A-Za-z]+)?\\s*<`,
	"g",
);

function scannedFiles(): string[] {
	const files: string[] = [];
	for (const root of SCANNED_ROOTS) {
		for (const relative of new Glob("**/*.ts").scanSync(`${repoRoot}${root}`)) {
			const path = `${root}/${relative}`;
			if (SKIPPED.some((skip) => `/${path}`.includes(skip))) continue;
			files.push(path);
		}
	}
	return files;
}

describe("system email senders", () => {
	const files = scannedFiles();

	test("scans the backend services", () => {
		expect(files.length).toBeGreaterThan(100);
	});

	test("no service hardcodes the product name in a From address", () => {
		const offenders: string[] = [];

		for (const path of files) {
			const source = readFileSync(`${repoRoot}${path}`, "utf8");
			for (const match of source.matchAll(HARDCODED_SENDER)) {
				const line = source.slice(0, match.index).split("\n").length;
				offenders.push(`${path}:${line} — ${match[0]}`);
			}
		}

		expect(offenders).toEqual([]);
	});
});
