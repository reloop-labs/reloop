import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";
import ts from "typescript";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

const SCANNED_ROOTS = ["apps/backend", "packages"];

const SKIPPED = [
	"/node_modules/",
	"/dist/",
	"/.turbo/",
	"/packages/code-samples/",
	".test.ts",
];

const LOGGER_IDENTIFIERS = new Set(["log", "logger", "console"]);

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

export function logCallArguments(path: string, source: string): string[] {
	const sourceFile = ts.createSourceFile(
		path,
		source,
		ts.ScriptTarget.Latest,
		true,
		path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);

	const calls: string[] = [];

	function visit(node: ts.Node): void {
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			ts.isIdentifier(node.expression.expression) &&
			LOGGER_IDENTIFIERS.has(node.expression.expression.text)
		) {
			calls.push(
				node.arguments.map((arg) => arg.getText(sourceFile)).join(", "),
			);
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
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

describe("log call scanner", () => {
	test("parentheses inside strings and templates do not end a call", () => {
		const source = [
			"log.info(`closing paren ) here`, payload);",
			'log.info("another ) one", { otp });',
			"log.info(/\\)/.source, records);",
		].join("\n");

		expect(logCallArguments("sample.ts", source)).toEqual([
			"`closing paren ) here`, payload",
			'"another ) one", { otp }',
			"/\\)/.source, records",
		]);
	});

	test("nested calls are captured separately", () => {
		expect(logCallArguments("sample.ts", "log.info(format(payload));")).toEqual(
			["format(payload)"],
		);
	});
});

describe("credentials never reach a log call", () => {
	const files = scannedFiles();

	test("scans the backend and shared packages", () => {
		expect(files.length).toBeGreaterThan(100);
	});

	test("no log or console call receives OTP, DKIM key, or raw event payload", () => {
		const offenders: string[] = [];

		for (const path of files) {
			const source = readFileSync(`${repoRoot}${path}`, "utf8");
			for (const args of logCallArguments(path, source)) {
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
