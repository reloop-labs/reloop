#!/usr/bin/env bun
/**
 * Update all PHP x-codeSamples to Reloop PHP SDK v2 (Node-parity).
 *
 * Derives PHP from the Node sample in each *.x-codeSamples.ts file.
 *
 * Usage (from reloop monorepo root):
 *   bun run apps/frontend/docs/scripts/update-php-sdk-v2-samples.ts
 *   # or: bun run --filter=fe-docs update:php-samples
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { upsertSample } from "./lib/python-sample-utils";

const REPO_ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../..",
);
const BACKEND_ROOT = path.join(REPO_ROOT, "apps/backend");

function findSampleFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...findSampleFiles(fullPath));
			continue;
		}
		if (entry.name.endsWith(".x-codeSamples.ts")) {
			files.push(fullPath);
		}
	}
	return files;
}

function splitTopLevel(input: string, delimiter: string): string[] {
	const parts: string[] = [];
	let current = "";
	let depth = 0;
	let quote: string | null = null;
	for (let i = 0; i < input.length; i++) {
		const char = input[i]!;
		if (quote) {
			current += char;
			if (char === quote && input[i - 1] !== "\\") quote = null;
			continue;
		}
		if (char === '"' || char === "'") {
			quote = char;
			current += char;
			continue;
		}
		if (char === "{" || char === "[" || char === "(") {
			depth++;
			current += char;
			continue;
		}
		if (char === "}" || char === "]" || char === ")") {
			depth--;
			current += char;
			continue;
		}
		if (char === delimiter && depth === 0) {
			if (current.trim()) parts.push(current.trim());
			current = "";
			continue;
		}
		current += char;
	}
	if (current.trim()) parts.push(current.trim());
	return parts;
}

function indexOfTopLevel(input: string, delimiter: string): number {
	let depth = 0;
	let quote: string | null = null;
	for (let i = 0; i < input.length; i++) {
		const char = input[i]!;
		if (quote) {
			if (char === quote && input[i - 1] !== "\\") quote = null;
			continue;
		}
		if (char === '"' || char === "'") {
			quote = char;
			continue;
		}
		if (char === "{" || char === "[" || char === "(") depth++;
		else if (char === "}" || char === "]" || char === ")") depth--;
		else if (char === delimiter && depth === 0) return i;
	}
	return -1;
}

function convertJsLiteralToPhp(literal: string, indent = 0): string {
	const pad = "    ".repeat(indent);
	const innerPad = "    ".repeat(indent + 1);
	const trimmed = literal.trim();

	if (trimmed.startsWith("[")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) return "[]";
		const items = splitTopLevel(inner, ",").map((item) =>
			convertJsLiteralToPhp(item.trim(), indent + 1),
		);
		if (items.every((i) => !i.includes("\n")) && items.join(", ").length < 72) {
			return `[${items.join(", ")}]`;
		}
		return `[\n${items.map((i) => `${innerPad}${i}`).join(",\n")},\n${pad}]`;
	}

	if (trimmed.startsWith("{")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) return "[]";
		const entries = splitTopLevel(inner, ",").map((entry) => {
			const colon = indexOfTopLevel(entry, ":");
			if (colon === -1) return convertScalar(entry);
			const rawKey = entry.slice(0, colon).trim().replace(/^["']|["']$/g, "");
			const rawVal = entry.slice(colon + 1).trim();
			return `${innerPad}'${rawKey}' => ${convertJsLiteralToPhp(rawVal, indent + 1)}`;
		});
		return `[\n${entries.join(",\n")},\n${pad}]`;
	}

	return convertScalar(trimmed);
}

function convertScalar(value: string): string {
	const trimmed = value.trim();
	if (trimmed === "true" || trimmed === "false" || trimmed === "null") {
		return trimmed;
	}
	if (/^".*"$/.test(trimmed)) {
		return `'${trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'")}'`;
	}
	if (/^'.*'$/.test(trimmed)) return trimmed;
	return trimmed;
}

function jsCalleeToPhp(callee: string): string {
	return callee
		.replace(/^reloop/, "$reloop")
		.replace(/\./g, "->");
}

const SUPPORTED_PHP_PREFIXES = [
	"reloop.mail.",
	"reloop.apiKey.",
	"reloop.domain.",
	"reloop.contacts.",
	"reloop.webhook.",
	"reloop.inbox.",
];

function isSupportedPhpCall(callExpr: string): boolean {
	return SUPPORTED_PHP_PREFIXES.some((p) => callExpr.startsWith(p));
}

function convertCallArgs(callExpr: string): string {
	const match = callExpr.match(/^(reloop(?:\.\w+)+)\(([\s\S]*)\)$/);
	if (!match) return callExpr;
	const callee = jsCalleeToPhp(match[1]!);
	const argsRaw = match[2]!.trim();
	if (!argsRaw) return `${callee}()`;

	const args = splitTopLevel(argsRaw, ",");
	const converted = args.map((arg) => {
		const trimmed = arg.trim();
		if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
			return convertJsLiteralToPhp(trimmed, 0);
		}
		return convertScalar(trimmed);
	});
	return `${callee}(${converted.join(", ")})`;
}

function rewriteEchoArgs(args: string, successNames: string[]): string {
	let printed = args;
	for (const name of successNames) {
		printed = printed.replace(
			new RegExp(`(?<!\\$)\\b${name}\\.(\\w+)\\b`, "g"),
			`$${name}['$1']`,
		);
	}
	return printed;
}

function nodeToPhp(nodeSource: string): string {
	const envMatch = nodeSource.match(/apiKey:\s*process\.env\.(\w+)!?/);
	const literalKey = nodeSource.match(/apiKey:\s*"([^"]+)"/)?.[1];
	const apiKeyExpr = envMatch
		? "getenv('RELOOP_API_KEY')"
		: `'${literalKey ?? "rl_123456789"}'`;

	let body = nodeSource.replace(
		/^[\s\S]*?const reloop = new Reloop\(\{[\s\S]*?\}\);\s*/,
		"",
	);

	body = body.replace(/\bawait\s+/g, "");

	const successNames: string[] = [];
	body = body.replace(
		/const\s*\{\s*([^}]+)\s*\}\s*=\s*/g,
		(_full, names: string) => {
			for (const part of names.split(",")) {
				const name = part.trim().split(":")[0]!.trim();
				if (name && !/Error$/.test(name)) {
					successNames.push(name);
				}
			}
			return "RESULT_ASSIGN = ";
		},
	);

	body = body.replace(
		/RESULT_ASSIGN = (reloop(?:\.\w+)+\([\s\S]*?\));?/g,
		(_full, callExpr: string) => {
			const trimmed = callExpr.trim();
			if (!isSupportedPhpCall(trimmed)) {
				throw new Error(`UNSUPPORTED:${trimmed}`);
			}
			const call = convertCallArgs(trimmed);
			const primary = successNames[0];
			if (primary) {
				return `$${primary} = ${call};`;
			}
			return `${call};`;
		},
	);

	// const x = reloop... (non-Result style)
	body = body.replace(
		/const\s+(\w+)\s*=\s*(reloop(?:\.\w+)+\([\s\S]*?\));?/g,
		(_full, name: string, callExpr: string) => {
			const trimmed = callExpr.trim();
			if (!isSupportedPhpCall(trimmed)) {
				throw new Error(`UNSUPPORTED:${trimmed}`);
			}
			successNames.push(name);
			return `$${name} = ${convertCallArgs(trimmed)};`;
		},
	);

	// Bare calls without destructuring (e.g. await reloop.domain.delete(...))
	body = body.replace(
		/^(?!\$)(reloop(?:\.\w+)+\([\s\S]*?\));?\s*$/gm,
		(_full, callExpr: string) => {
			const trimmed = callExpr.trim();
			if (!isSupportedPhpCall(trimmed)) {
				throw new Error(`UNSUPPORTED:${trimmed}`);
			}
			return `${convertCallArgs(trimmed)};`;
		},
	);

	body = body.replace(/if\s*\((\w+)Error\)\s*throw\s+\1Error;?/g, "");

	body = body.replace(
		/console\.log\(([\s\S]*?)\);?/g,
		(_full, args: string) => {
			const rewritten = rewriteEchoArgs(args, successNames)
				.replace(/,\s*/g, " . ' ' . ");
			return `echo ${rewritten} . PHP_EOL;`;
		},
	);

	body = body
		.split("\n")
		.map((line) => line.replace(/\s+$/, ""))
		.filter((line) => line.trim() !== "")
		.join("\n")
		.trim();

	if (body.includes("RESULT_ASSIGN") || body.includes("console.log") || /const \{/.test(body)) {
		throw new Error(`Incomplete PHP conversion:\n${body}`);
	}

	return `<?php

require 'vendor/autoload.php';

use Reloop\\Reloop;

$reloop = Reloop::client(${apiKeyExpr});

${body}`;
}

function main() {
	const files = findSampleFiles(BACKEND_ROOT);
	let updated = 0;
	let skipped = 0;

	for (const file of files) {
		const content = fs.readFileSync(file, "utf8");
		const nodeMatch = content.match(
			/\{\s*id:\s*"node"[\s\S]*?source:\s*`([\s\S]*?)`\s*,?\s*\}/m,
		);
		if (!nodeMatch) {
			skipped++;
			continue;
		}
		const nodeSource = nodeMatch[1]!;
		if (!nodeSource.includes("new Reloop")) {
			skipped++;
			continue;
		}

		try {
			const php = nodeToPhp(nodeSource);
			const next = upsertSample(content, "php", "php", "PHP", php);
			fs.writeFileSync(file, next);
			updated++;
			console.log("updated", path.relative(REPO_ROOT, file));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			if (message.startsWith("UNSUPPORTED:")) {
				skipped++;
				console.log("skipped", path.relative(REPO_ROOT, file), message.slice(12));
				continue;
			}
			console.error("failed", path.relative(REPO_ROOT, file), error);
			process.exitCode = 1;
		}
	}

	console.log(`Done. updated=${updated} skipped=${skipped} total=${files.length}`);
}

main();
