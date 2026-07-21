#!/usr/bin/env bun
/**
 * Update all Python x-codeSamples to Reloop Python SDK v2 (Node-parity Result API).
 *
 * Derives Python from the Node sample in each *.x-codeSamples.ts file.
 *
 * Usage (from reloop monorepo root):
 *   bun run apps/frontend/docs/scripts/update-python-sdk-v2-samples.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

function camelToSnake(value: string): string {
	return value
		.replace(/([a-z0-9])([A-Z])/g, "$1_$2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
		.toLowerCase();
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

function convertJsLiteralToPython(literal: string, indent = 0): string {
	const pad = "  ".repeat(indent);
	const innerPad = "  ".repeat(indent + 1);
	const trimmed = literal.trim();

	if (trimmed.startsWith("[")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) return "[]";
		const items = splitTopLevel(inner, ",").map((item) =>
			convertJsLiteralToPython(item.trim(), indent + 1),
		);
		if (items.every((i) => !i.includes("\n")) && items.join(", ").length < 72) {
			return `[${items.join(", ")}]`;
		}
		return `[\n${items.map((i) => `${innerPad}${i}`).join(",\n")},\n${pad}]`;
	}

	if (trimmed.startsWith("{")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) return "{}";
		const entries = splitTopLevel(inner, ",").map((entry) => {
			const colon = indexOfTopLevel(entry, ":");
			if (colon === -1) return convertScalar(entry);
			const rawKey = entry.slice(0, colon).trim().replace(/^["']|["']$/g, "");
			const rawVal = entry.slice(colon + 1).trim();
			return `${innerPad}"${rawKey}": ${convertJsLiteralToPython(rawVal, indent + 1)}`;
		});
		return `{\n${entries.join(",\n")},\n${pad}}`;
	}

	return convertScalar(trimmed);
}

function convertScalar(value: string): string {
	const trimmed = value.trim();
	if (trimmed === "true") return "True";
	if (trimmed === "false") return "False";
	if (trimmed === "null") return "None";
	return trimmed;
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

function convertCallArgs(callExpr: string): string {
	const match = callExpr.match(/^(reloop(?:\.\w+)+)\(([\s\S]*)\)$/);
	if (!match) return callExpr;
	const callee = match[1]!.replace(/\.apiKey\b/g, ".api_key");
	const argsRaw = match[2]!.trim();
	if (!argsRaw) return `${callee}()`;

	const args = splitTopLevel(argsRaw, ",");
	const converted = args.map((arg) => {
		const trimmed = arg.trim();
		if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
			return convertJsLiteralToPython(trimmed, 0);
		}
		return convertScalar(trimmed);
	});
	return `${callee}(${converted.join(", ")})`;
}

function rewritePrintArgs(args: string, successNames: string[]): string {
	let printed = args;
	for (const name of successNames) {
		const snake = camelToSnake(name);
		// Only rewrite property access: domain.id → result.domain["id"]
		// Do NOT rewrite bare identifiers (would corrupt result.domain).
		printed = printed.replace(
			new RegExp(`(?<!\\.)\\b${name}\\.(\\w+)\\b`, "g"),
			`result.${snake}["$1"]`,
		);
	}
	return printed;
}

function nodeToPython(nodeSource: string): string {
	const envMatch = nodeSource.match(/apiKey:\s*process\.env\.(\w+)!?/);
	const literalKey = nodeSource.match(/apiKey:\s*"([^"]+)"/)?.[1];
	const apiKeyExpr = envMatch
		? 'os.environ["RELOOP_API_KEY"]'
		: `"${literalKey ?? "rl_123456789"}"`;
	const needsOs = Boolean(envMatch);

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

	// Convert RESULT_ASSIGN = call(...) including multiline argument lists
	body = body.replace(
		/RESULT_ASSIGN = (reloop(?:\.\w+)+\([\s\S]*?\));?/g,
		(_full, callExpr: string) => `result = ${convertCallArgs(callExpr.trim())}`,
	);

	body = body.replace(
		/if\s*\((\w+)Error\)\s*throw\s+\1Error;?/g,
		(_full, name: string) => {
			const snake = camelToSnake(name);
			return `if result.${snake}_error:\n    raise result.${snake}_error`;
		},
	);

	body = body.replace(
		/console\.log\(([\s\S]*?)\);?/g,
		(_full, args: string) => `print(${rewritePrintArgs(args, successNames)})`,
	);

	body = body
		.split("\n")
		.map((line) => line.replace(/\s+$/, ""))
		.join("\n")
		.trim();

	if (body.includes("RESULT_ASSIGN") || body.includes("console.log") || /const \{/.test(body)) {
		throw new Error(`Incomplete conversion:\n${body}`);
	}

	const imports = needsOs
		? `import os\nfrom reloop_email import Reloop`
		: `from reloop_email import Reloop`;

	return `${imports}

reloop = Reloop(api_key=${apiKeyExpr})

${body}`;
}

function replacePythonSample(content: string, pythonSource: string): string {
	const block = `\t{
\t\tid: "python",
\t\tlang: "python",
\t\tlabel: "Python",
\t\tsource: \`${pythonSource.replace(/\\/g, "\\\\").replace(/`/g, "\\`")}\`,
\t}`;

	if (!content.includes('id: "python"')) {
		throw new Error("No python sample block found");
	}

	return content.replace(
		/\{\s*id:\s*"python"[\s\S]*?source:\s*`[\s\S]*?`\s*,?\s*\}/m,
		block,
	);
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
			const python = nodeToPython(nodeSource);
			const next = replacePythonSample(content, python);
			fs.writeFileSync(file, next);
			updated++;
			console.log("updated", path.relative(REPO_ROOT, file));
		} catch (error) {
			console.error("failed", path.relative(REPO_ROOT, file), error);
			process.exitCode = 1;
		}
	}

	console.log(`Done. updated=${updated} skipped=${skipped} total=${files.length}`);
}

main();
