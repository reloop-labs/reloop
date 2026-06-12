import fs from "node:fs";
import path from "node:path";

export const REPO_ROOT = path.resolve(__dirname, "../../../../..");
export const BACKEND_ROOT = path.join(REPO_ROOT, "apps/backend");

export const SERVICE_DIRS = [
	{ name: "contacts", dir: path.join(BACKEND_ROOT, "contacts/src/routes") },
	{ name: "api-key", dir: path.join(BACKEND_ROOT, "api-key/src/routes") },
];

export function findSampleFiles(dir: string): string[] {
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

export function extractSampleSource(
	content: string,
	id: string,
): string | null {
	const pattern = new RegExp(
		`\\{\\s*id:\\s*"${id}"[\\s\\S]*?source:\\s*\`([\\s\\S]*?)\`,\\s*\\}`,
		"m",
	);
	const match = content.match(pattern);
	return match?.[1] ?? null;
}

export function splitTopLevel(input: string, delimiter: string): string[] {
	const parts: string[] = [];
	let current = "";
	let depth = 0;
	let quote: string | null = null;

	for (let index = 0; index < input.length; index++) {
		const char = input[index];

		if (quote) {
			current += char;
			if (char === quote && input[index - 1] !== "\\") {
				quote = null;
			}
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
			if (current.trim()) {
				parts.push(current.trim());
			}
			current = "";
			continue;
		}

		current += char;
	}

	if (current.trim()) {
		parts.push(current.trim());
	}

	return parts;
}

export function parsePythonCall(python: string): {
	apiKey: string;
	call: string;
} {
	const apiKeyMatch = python.match(/api_key="([^"]+)"/);
	const apiKey = apiKeyMatch?.[1] ?? "re_123456789";
	const call = python
		.replace(/^reloop = Reloop\(api_key="[^"]+"\)\n\n?/, "")
		.trim();
	return { apiKey, call };
}

export function snakeToPascal(key: string): string {
	return key
		.split("_")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

export function parseKwargs(
	block: string,
): Array<{ key: string; value: string }> {
	return splitTopLevel(block, ",")
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			const equalIndex = entry.indexOf("=");
			if (equalIndex === -1) {
				throw new Error(`Invalid kwarg: ${entry}`);
			}
			return {
				key: entry.slice(0, equalIndex).trim(),
				value: entry.slice(equalIndex + 1).trim(),
			};
		});
}

export function upsertSample(
	content: string,
	languageId: string,
	lang: string,
	label: string,
	source: string,
): string {
	const block = `\t{\n\t\tid: "${languageId}",\n\t\tlang: "${lang}",\n\t\tlabel: "${label}",\n\t\tsource: \`${source}\`,\n\t}`;

	if (content.includes(`id: "${languageId}"`)) {
		return content.replace(
			new RegExp(
				`\\{\\s*id:\\s*"${languageId}"[\\s\\S]*?source:\\s*\`[\\s\\S]*?\`,\\s*\\}`,
				"m",
			),
			block,
		);
	}

	const pythonMatch = content.match(
		/\{\s*id:\s*"python"[\s\S]*?source:\s*`[\s\S]*?`,\s*\}/m,
	);
	if (!pythonMatch || pythonMatch.index === undefined) {
		throw new Error("Could not find python sample block");
	}

	const insertAt = pythonMatch.index + pythonMatch[0].length;
	return `${content.slice(0, insertAt)},\n${block}${content.slice(insertAt)}`;
}

export function convertPythonValueToJsonMacro(value: string): string {
	const trimmed = value.trim();

	if (/^(True|False)$/.test(trimmed)) {
		return trimmed === "True" ? "true" : "false";
	}

	if (/^-?\d+$/.test(trimmed)) {
		return trimmed;
	}

	if (/^".*"$/.test(trimmed) || /^'.*'$/.test(trimmed)) {
		return trimmed.replace(/^'/, '"').replace(/'$/, '"');
	}

	if (trimmed.startsWith("{")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) {
			return "json!({})";
		}

		const entries = splitTopLevel(inner, ",").map((entry) => {
			const colonIndex = entry.indexOf(":");
			if (colonIndex === -1) {
				return entry.trim();
			}
			const key = entry
				.slice(0, colonIndex)
				.trim()
				.replace(/^["']|["']$/g, "");
			const entryValue = convertPythonValueToJsonMacro(
				entry.slice(colonIndex + 1),
			);
			return `"${key}": ${entryValue}`;
		});

		return `json!({\n        ${entries.join(",\n        ")},\n    })`;
	}

	if (trimmed.startsWith("[")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) {
			return "json!([])";
		}

		const items = splitTopLevel(inner, ",").map((item) =>
			convertPythonValueToJsonMacro(item),
		);
		return `json!([\n        ${items.join(",\n        ")},\n    ])`;
	}

	return trimmed;
}

export function convertPythonValueToJsonLiteral(value: string): string {
	const trimmed = value.trim();

	if (/^(True|False)$/.test(trimmed)) {
		return trimmed === "True" ? "true" : "false";
	}

	if (/^-?\d+$/.test(trimmed)) {
		return trimmed;
	}

	if (/^".*"$/.test(trimmed) || /^'.*'$/.test(trimmed)) {
		return trimmed.replace(/^'/, '"').replace(/'$/, '"');
	}

	if (trimmed.startsWith("{")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) {
			return "{}";
		}

		const entries = splitTopLevel(inner, ",").map((entry) => {
			const colonIndex = entry.indexOf(":");
			const key = entry
				.slice(0, colonIndex)
				.trim()
				.replace(/^["']|["']$/g, "");
			const entryValue = convertPythonValueToJsonLiteral(
				entry.slice(colonIndex + 1),
			);
			return `"${key}": ${entryValue}`;
		});

		return `{\n        ${entries.join(",\n        ")},\n    }`;
	}

	if (trimmed.startsWith("[")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) {
			return "[]";
		}

		const items = splitTopLevel(inner, ",").map((item) =>
			convertPythonValueToJsonLiteral(item),
		);
		return `[\n        ${items.join(",\n        ")},\n    ]`;
	}

	return trimmed;
}

export function pythonKwargsToJsonMacro(block: string): string {
	const entries = parseKwargs(block).map(
		({ key, value }) => `"${key}": ${convertPythonValueToJsonLiteral(value)}`,
	);
	return `json!({\n        ${entries.join(",\n        ")},\n    })`;
}

export function convertPythonValueToCSharp(value: string): string {
	const trimmed = value.trim();

	if (/^(True|False)$/.test(trimmed)) {
		return trimmed === "True" ? "true" : "false";
	}

	if (/^-?\d+$/.test(trimmed)) {
		return trimmed;
	}

	if (/^".*"$/.test(trimmed) || /^'.*'$/.test(trimmed)) {
		return trimmed.replace(/^'/, '"').replace(/'$/, '"');
	}

	if (trimmed.startsWith("{")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) {
			return "new Dictionary<string, object?>()";
		}

		const entries = splitTopLevel(inner, ",").map((entry) => {
			const colonIndex = entry.indexOf(":");
			const key = entry
				.slice(0, colonIndex)
				.trim()
				.replace(/^["']|["']$/g, "");
			const entryValue = convertPythonValueToCSharp(
				entry.slice(colonIndex + 1),
			);
			return `["${key}"] = ${entryValue}`;
		});

		return `new Dictionary<string, object?>\n{\n    ${entries.join(",\n    ")},\n}`;
	}

	if (trimmed.startsWith("[")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) {
			return "Array.Empty<object?>()";
		}

		const items = splitTopLevel(inner, ",").map((item) =>
			convertPythonValueToCSharp(item),
		);
		return `new object?[] { ${items.join(", ")} }`;
	}

	return trimmed;
}

export function buildCSharpDictionaryArgument(block: string): {
	setupLines: string[];
	expression: string;
} {
	const entries = parseKwargs(block).map(({ key, value }) => ({
		key,
		value: convertPythonValueToCSharp(value),
	}));

	const hasNested = entries.some(
		({ value }) =>
			value.startsWith("new Dictionary") || value.startsWith("new object?[]"),
	);

	if (!hasNested && entries.length <= 4) {
		return {
			setupLines: [],
			expression: `new Dictionary<string, object?>\n{\n    ${entries.map(({ key, value }) => `["${key}"] = ${value}`).join(",\n    ")},\n}`,
		};
	}

	const setupLines = ["var parameters = new Dictionary<string, object?>();"];
	for (const { key, value } of entries) {
		setupLines.push(`parameters["${key}"] = ${value};`);
	}

	return { setupLines, expression: "parameters" };
}
