import fs from "node:fs";
import path from "node:path";

export interface CodeSample {
	id: string;
	lang: string;
	label: string;
	source: string;
}

const SKIP_FILES = new Set([
	"index.ts",
	"types.ts",
	"helpers.ts",
	"languages.ts",
]);

/** Recursively find sample modules (package or legacy co-located files). */
export function findSampleFiles(dir: string): string[] {
	const files: string[] = [];
	if (!fs.existsSync(dir)) {
		return files;
	}
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...findSampleFiles(fullPath));
			continue;
		}
		if (
			entry.name.endsWith(".x-codeSamples.ts") ||
			(entry.name.endsWith(".ts") &&
				!SKIP_FILES.has(entry.name) &&
				!entry.name.endsWith(".test.ts") &&
				!entry.name.endsWith(".d.ts"))
		) {
			// Only keep files that look like sample modules
			const content = fs.readFileSync(fullPath, "utf8");
			if (
				content.includes("XCodeSamples") ||
				content.includes("CodeSample[]") ||
				entry.name.endsWith(".x-codeSamples.ts")
			) {
				files.push(fullPath);
			}
		}
	}
	return files;
}

export function extractSamples(filePath: string): CodeSample[] {
	const content = fs.readFileSync(filePath, "utf8");
	const samples: CodeSample[] = [];
	const samplePattern =
		/\{\s*id:\s*"([^"]+)"[\s\S]*?lang:\s*"([^"]+)"[\s\S]*?label:\s*"([^"]+)"[\s\S]*?source:\s*`([\s\S]*?)`\s*,?\s*\}/g;

	for (const match of content.matchAll(samplePattern)) {
		samples.push({
			id: match[1]!,
			lang: match[2]!,
			label: match[3]!,
			source: match[4]!,
		});
	}
	return samples;
}

export function sampleById(
	samples: CodeSample[],
	id: string,
): CodeSample | undefined {
	return samples.find((s) => s.id === id);
}

export function escapeTemplateLiteral(source: string): string {
	return source
		.replace(/\\/g, "\\\\")
		.replace(/`/g, "\\`")
		.replace(/\$\{/g, "\\${");
}

export function parseCurlMeta(curlSource: string): {
	method: string;
	endpoint: string;
} {
	const method = (curlSource.match(/-X\s+(\w+)/i)?.[1] ?? "GET").toUpperCase();
	const urlMatch = curlSource.match(/https?:\/\/[^\s"'\\]+/);
	if (!urlMatch) {
		throw new Error("Could not parse URL from curl sample");
	}
	const raw = urlMatch[0].replace(/\\$/g, "");
	const pathname = new URL(raw.split("?")[0]!).pathname;
	const endpoint = pathname
		.replace(/\/key_[^/]+/g, "/:id")
		.replace(/\/\{api_key_id\}/g, "/:id");
	return { method, endpoint };
}

/** create-api-key → create, list-api-keys → list */
export function folderToOpKey(folder: string): string {
	return folder
		.replace(/-api-keys$/i, "")
		.replace(/-api-key$/i, "")
		.replace(/-keys$/i, "")
		.replace(/-key$/i, "");
}

export function opKeyToLabel(key: string): string {
	if (key === "list") return "List Keys";
	return `${key.charAt(0).toUpperCase()}${key.slice(1)} Key`;
}

export function loadDocSlugIndex(docsDir: string): Map<string, string> {
	const index = new Map<string, string>();
	if (!fs.existsSync(docsDir)) {
		return index;
	}
	for (const entry of fs.readdirSync(docsDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
		const content = fs.readFileSync(path.join(docsDir, entry.name), "utf8");
		const jsonMatch = content.match(
			/operationData:\s*\[\{"path":"([^"]+)","method":"([^"]+)"\}\]/,
		);
		if (!jsonMatch) continue;
		const routePath = jsonMatch[1]!;
		const method = jsonMatch[2]!.toLowerCase();
		const slug = entry.name.replace(/\.mdx$/, "");
		index.set(`${method}:${routePath}`, slug);
		const normalized = routePath.replace(/\{[^}]+\}/g, ":id");
		index.set(`${method}:${normalized}`, slug);
	}
	return index;
}

export function resolveDocSlug(
	index: Map<string, string>,
	method: string,
	endpoint: string,
): string | undefined {
	const m = method.toLowerCase();
	const candidates = [
		`${m}:${endpoint}`,
		`${m}:${endpoint.replace(/\/:id/g, "/{api_key_id}")}`,
		`${m}:${endpoint.replace(/\/:id/g, "/{id}")}`,
	];
	for (const key of candidates) {
		const hit = index.get(key);
		if (hit) return hit;
	}
	const noSlash = endpoint.replace(/\/$/, "") || endpoint;
	return index.get(`${m}:${noSlash}`) ?? index.get(`${m}:${noSlash}/`);
}
