import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
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

const LOG_CALL = /(?:\blog|\bconsole)\.[a-z]+\(/g;

const FORBIDDEN_IN_LOG_ARGS: { name: string; pattern: RegExp }[] = [
	{ name: "interpolated secret", pattern: /\$\{[^}]*\b(otp|privateKey)\b/i },
	{
		name: "secret shorthand property",
		pattern: /[{,]\s*(otp|privateKey)\s*[,}]/,
	},
	{ name: "secret property value", pattern: /\b(otp|privateKey)\s*:/i },
	{ name: "whole event payload", pattern: /[{,]\s*payload\s*[,}]/ },
	{ name: "whole dns record set", pattern: /[{,]\s*records\s*[,}]/ },
];

function logCallArguments(source: string): string[] {
	const calls: string[] = [];
	for (const match of source.matchAll(LOG_CALL)) {
		let depth = 1;
		let i = (match.index ?? 0) + match[0].length;
		const start = i;
		while (i < source.length && depth > 0) {
			const char = source[i];
			if (char === "(") depth++;
			else if (char === ")") depth--;
			i++;
		}
		calls.push(source.slice(start, i - 1));
	}
	return calls;
}

function scannedFiles(): string[] {
	const files: string[] = [];
	for (const root of SCANNED_ROOTS) {
		for (const relative of new Glob("**/*.{ts,tsx}").scanSync(
			`${repoRoot}${root}`,
		)) {
			const path = `${root}/${relative}`;
			if (SKIPPED.some((skip) => `/${path}`.includes(skip))) continue;
			files.push(path);
		}
	}
	return files;
}

describe("credentials never reach a log call", () => {
	const files = scannedFiles();

	test("scans the backend and shared packages", () => {
		expect(files.length).toBeGreaterThan(100);
	});

	test("no log or console call receives OTP, DKIM key, or raw event payload", () => {
		const offenders: string[] = [];

		for (const path of files) {
			const source = readFileSync(`${repoRoot}${path}`, "utf8");
			for (const args of logCallArguments(source)) {
				for (const { name, pattern } of FORBIDDEN_IN_LOG_ARGS) {
					if (pattern.test(args)) {
						offenders.push(`${path}: ${name} — ${args.replace(/\s+/g, " ")}`);
					}
				}
			}
		}

		expect(offenders).toEqual([]);
	});
});

describe("DKIM private keys stay out of the verification worker", () => {
	const handler = readFileSync(
		`${repoRoot}apps/backend/workflow/src/handlers/domain-verification.handler.ts`,
		"utf8",
	);

	test("the dns record query selects an explicit column allowlist", () => {
		expect(handler).toContain("columns: {");
		expect(handler).not.toContain("privateKey");
	});
});
