#!/usr/bin/env bun
/**
 * Updates Python code samples in x-codeSamples.ts from PHP SDK samples.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../../..");
const ROUTE_DIRS = [
	path.join(ROOT, "apps/backend/contacts/src/routes"),
	path.join(ROOT, "apps/backend/api-key/src/routes"),
];

function camelToSnake(value: string): string {
	return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

function convertPhpScalar(value: string): string {
	const trimmed = value.trim();
	if (trimmed === "true") return "True";
	if (trimmed === "false") return "False";
	if (/^-?\d+$/.test(trimmed)) return trimmed;
	if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
		return `"${trimmed.slice(1, -1)}"`;
	}
	return trimmed;
}

function convertPhpArrayBlock(block: string, indent: string): string {
	const lines = block.split("\n");
	const out: string[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i]?.trim() ?? "";
		i++;

		if (!line || line === "]," || line === "],") continue;
		if (line === "]," || line === "],") break;

		const entry = line.match(/^'([^']+)'\s*=>\s*(.+?),?$/);
		if (!entry) continue;

		const [, key, rawValue] = entry;
		if (rawValue.trim() === "[") {
			const nested: string[] = [];
			while (i < lines.length) {
				const nestedLine = lines[i]?.trim() ?? "";
				i++;
				if (nestedLine === "]," || nestedLine === "],") break;
				nested.push(nestedLine);
			}
			out.push(`${indent}${key}=[`);
			out.push(`${indent}    {`);
			for (const nestedEntry of nested) {
				const nestedMatch = nestedEntry.match(/^'([^']+)'\s*=>\s*(.+?),?$/);
				if (nestedMatch) {
					out.push(
						`${indent}        "${nestedMatch[1]}": ${convertPhpScalar(nestedMatch[2]).replace(/^"/, "").replace(/"$/, "") === convertPhpScalar(nestedMatch[2]) ? convertPhpScalar(nestedMatch[2]) : convertPhpScalar(nestedMatch[2])},`,
					);
				}
			}
			out.push(`${indent}    },`);
			out.push(`${indent}],`);
			continue;
		}

		out.push(`${indent}${key}=${convertPhpScalar(rawValue)},`);
	}

	return out.join("\n");
}

function convertPhpToPython(php: string): string {
	const clientMatch = php.match(/\$reloop = Reloop::client\('([^']+)'\);/);
	if (!clientMatch) return php;

	const apiKey = clientMatch[1];
	let call = php.replace(/\$reloop = Reloop::client\('[^']+'\);\n\n?/, "").trim();

	call = call
		.replace(/\$reloop->contacts->channels->(\w+)/g, (_, method) =>
			`reloop.contacts.channels.${camelToSnake(method)}`,
		)
		.replace(/\$reloop->contacts->groups->(\w+)/g, (_, method) =>
			`reloop.contacts.groups.${camelToSnake(method)}`,
		)
		.replace(/\$reloop->contacts->(\w+)/g, (_, method) =>
			`reloop.contacts.${camelToSnake(method)}`,
		)
		.replace(/\$reloop->apiKeys->(\w+)/g, (_, method) =>
			`reloop.api_keys.${camelToSnake(method)}`,
		);

	const simpleCall = call.match(/^([\s\S]+?\([^)]*\))\('([^']+)'\);$/);
	if (simpleCall && !call.includes("parameters:") && !call.includes("options:")) {
		return `reloop = Reloop(api_key="${apiKey}")\n\n${simpleCall[1]}("${simpleCall[2]}")`;
	}

	const positionalMatch = call.match(/^([\s\S]+?)\(\s*'([^']+)',\s*\n\s*parameters:\s*\[([\s\S]*?)\],\s*\);$/);
	if (positionalMatch) {
		const [, fn, id, paramsBlock] = positionalMatch;
		const params = convertPhpArrayBlock(paramsBlock, "    ").replace(/,$/, "");
		return `reloop = Reloop(api_key="${apiKey}")\n\n${fn}(\n    "${id}",\n${params}\n)`;
	}

	const optionsMatch = call.match(/^([\s\S]+?)\(\s*\n\s*options:\s*\[([\s\S]*?)\],\s*\);$/);
	if (optionsMatch) {
		const [, fn, paramsBlock] = optionsMatch;
		const params = convertPhpArrayBlock(paramsBlock, "    ").replace(/,$/, "");
		return `reloop = Reloop(api_key="${apiKey}")\n\n${fn}(\n${params}\n)`;
	}

	const parametersMatch = call.match(/^([\s\S]+?)\(\s*\n\s*parameters:\s*\[([\s\S]*?)\],\s*\);$/);
	if (parametersMatch) {
		const [, fn, paramsBlock] = parametersMatch;
		const params = convertPhpArrayBlock(paramsBlock, "    ").replace(/,$/, "");
		return `reloop = Reloop(api_key="${apiKey}")\n\n${fn}(\n${params}\n)`;
	}

	const positionalOnly = call.match(/^([\s\S]+?)\('([^']+)'\);$/);
	if (positionalOnly) {
		return `reloop = Reloop(api_key="${apiKey}")\n\n${positionalOnly[1]}("${positionalOnly[2]}")`;
	}

	return `reloop = Reloop(api_key="${apiKey}")\n\n${call}`;
}

function walkFiles(dir: string, ext: string, results: string[] = []): string[] {
	if (!fs.existsSync(dir)) return results;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) walkFiles(fullPath, ext, results);
		else if (entry.name.endsWith(ext)) results.push(fullPath);
	}
	return results;
}

function updatePythonSample(file: string): boolean {
	const content = fs.readFileSync(file, "utf8");
	const phpMatch = content.match(
		/id: "php"[\s\S]*?source: `([\s\S]*?)`,\n\t\}/,
	);
	if (!phpMatch) return false;

	const python = convertPhpToPython(phpMatch[1]);
	const next = content.replace(
		/(id: "python"[\s\S]*?source: `)([\s\S]*?)(`,\n\t\})/,
		`$1${python}$3`,
	);

	if (next === content) return false;
	fs.writeFileSync(file, next);
	return true;
}

let updated = 0;
for (const dir of ROUTE_DIRS) {
	for (const file of walkFiles(dir, ".x-codeSamples.ts")) {
		if (updatePythonSample(file)) {
			updated++;
			console.log(`✅ ${path.relative(ROOT, file)}`);
		}
	}
}

console.log(`\nUpdated Python samples in ${updated} files.`);
