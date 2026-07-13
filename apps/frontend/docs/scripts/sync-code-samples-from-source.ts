#!/usr/bin/env bun
/**
 * Syncs code samples from backend x-codeSamples.ts into generated MDX frontmatter.
 */

import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "../../../..");
const BACKEND_ROOT = path.join(REPO_ROOT, "apps/backend");
const DOCS_API_DIR = path.join(
	REPO_ROOT,
	"apps/frontend/docs/content/docs/api",
);
const WATCHER_TRIGGER = path.join(
	REPO_ROOT,
	"apps/frontend/docs/src/lib/watcher-trigger.ts",
);

const CHECK = process.argv.includes("--check");
const TARGETS = process.argv.slice(2).filter((a) => a !== "--check");

interface CodeSample {
	id: string;
	lang: string;
	label: string;
	source: string;
}

interface SampleSource {
	path: string;
	method: string;
	samples: CodeSample[];
}

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

function normalizePath(routePath: string): string {
	if (routePath.startsWith("/api-key/") || routePath.startsWith("/template/")) {
		return `/api${routePath}`;
	}
	return routePath;
}

function normalizeRouteKey(pathValue: string, method: string): string {
	const cleaned = pathValue.replace(/^['"]|['"]$/g, "");
	const templated = cleaned
		.replace(/\/cont_[^/\s?]+/g, "/{contact_id}")
		.replace(/\/dom_[^/\s?]+/g, "/{domain_id}")
		.replace(/\/grp_[^/\s?]+/g, "/{group_id}")
		.replace(/\/chn_[^/\s?]+/g, "/{channel_id}")
		.replace(/\/channel_[^/\s?]+/g, "/{channel_id}")
		.replace(/\/prop_[^/\s?]+/g, "/{contact_property_id}")
		.replace(/\/key_[^/\s?]+/g, "/{api_key_id}")
		.replace(/\/tpl_[^/\s?]+/g, "/{id}")
		.replace(/\/ver_[^/\s?]+/g, "/{versionId}");
	return `${method}:${templated}`;
}

function extractSamples(filePath: string): SampleSource | null {
	const content = fs.readFileSync(filePath, "utf8");
	const curlSample = content.match(
		/id:\s*"curl"[\s\S]*?source:\s*`([\s\S]*?)`/,
	)?.[1];
	const method = (curlSample?.match(/-X\s+(\w+)/i)?.[1] ?? "GET").toLowerCase();

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

	if (samples.length === 0) {
		return null;
	}

	const pathMatch = curlSample?.match(
		/https:\/\/[^\s'"]+(\/(?:api[^\s'"?]+|template[^\s'"?]+))/,
	);
	if (!pathMatch) {
		return null;
	}

	return {
		path: normalizePath(pathMatch[1]!),
		method,
		samples,
	};
}

function findMdxFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...findMdxFiles(fullPath));
			continue;
		}
		if (entry.name.endsWith(".mdx")) {
			files.push(fullPath);
		}
	}
	return files;
}

function parseFrontmatter(
	content: string,
): { frontmatter: string; body: string } | null {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) {
		return null;
	}
	return { frontmatter: match[1]!, body: match[2]! };
}

function getOperation(
	content: string,
): { path: string; method: string } | null {
	const yamlPathMatch = content.match(/^\s*-\s*path:\s*(.+)$/m);
	const yamlMethodMatch = content.match(/^\s*method:\s*(.+)$/m);
	if (yamlPathMatch && yamlMethodMatch) {
		return {
			path: yamlPathMatch[1]!.trim().replace(/^['"]|['"]$/g, ""),
			method: yamlMethodMatch[1]!.trim().toLowerCase(),
		};
	}

	const jsonMatch = content.match(
		/operationData:\s*\[\{"path":"([^"]+)","method":"([^"]+)"\}\]/,
	);
	if (jsonMatch) {
		return {
			path: jsonMatch[1]!,
			method: jsonMatch[2]!.toLowerCase(),
		};
	}

	return null;
}

function renderCodeSamples(samples: CodeSample[]): string {
	const lines = ["  codeSamples:"];
	for (const sample of samples) {
		lines.push(`    - id: ${sample.id}`);
		lines.push(`      lang: ${sample.lang}`);
		lines.push(`      label: ${sample.label}`);
		lines.push("      source: |-");
		for (const line of sample.source.split("\n")) {
			lines.push(`        ${line}`);
		}
	}
	return lines.join("\n");
}

function replaceCodeSamples(
	frontmatter: string,
	samples: CodeSample[],
): string {
	const rendered = renderCodeSamples(samples);
	if (/^\s*codeSamples:/m.test(frontmatter)) {
		return frontmatter.replace(/^\s*codeSamples:[\s\S]*$/m, rendered);
	}
	return frontmatter.replace(
		/(_apiData:[\s\S]*?)(^\S|\s*$)/m,
		`$1${rendered}\n`,
	);
}

function bumpWatcherTrigger(): void {
	fs.writeFileSync(
		WATCHER_TRIGGER,
		`export const timestamp = ${Date.now()};\n`,
	);
}

const services = [
	{ name: "contacts", dir: path.join(BACKEND_ROOT, "contacts/src/routes") },
	{ name: "api-key", dir: path.join(BACKEND_ROOT, "api-key/src/routes") },
	{ name: "domain", dir: path.join(BACKEND_ROOT, "domain/src/routes") },
	{ name: "mail", dir: path.join(BACKEND_ROOT, "mail/src/routes") },
	{ name: "template", dir: path.join(BACKEND_ROOT, "template/src/routes") },
];

const sampleIndex = new Map<string, SampleSource>();
for (const service of services) {
	if (TARGETS.length > 0 && !TARGETS.includes(service.name)) {
		continue;
	}
	for (const filePath of findSampleFiles(service.dir)) {
		const source = extractSamples(filePath);
		if (!source) {
			continue;
		}
		sampleIndex.set(normalizeRouteKey(source.path, source.method), source);
	}
}

let updated = 0;
let stale = 0;
for (const mdxPath of findMdxFiles(DOCS_API_DIR)) {
	const content = fs.readFileSync(mdxPath, "utf8");
	const parsed = parseFrontmatter(content);
	if (!parsed) {
		continue;
	}
	const operation = getOperation(parsed.frontmatter);
	if (!operation) {
		continue;
	}
	const source = sampleIndex.get(
		normalizeRouteKey(operation.path, operation.method),
	);
	if (!source) {
		continue;
	}
	const nextFrontmatter = replaceCodeSamples(
		parsed.frontmatter,
		source.samples,
	);
	if (nextFrontmatter === parsed.frontmatter) {
		continue;
	}
	if (CHECK) {
		stale++;
		console.error(`Out of date: ${path.relative(REPO_ROOT, mdxPath)}`);
		continue;
	}
	fs.writeFileSync(mdxPath, `---\n${nextFrontmatter}\n---\n${parsed.body}`);
	updated++;
	console.log(`Updated ${path.relative(REPO_ROOT, mdxPath)}`);
}

if (CHECK) {
	if (stale > 0) {
		console.error(
			`\n${stale} MDX file(s) out of date. Run: bun run sync:sdk-samples`,
		);
		process.exit(1);
	}
	console.log("OK: docs code samples match backend x-codeSamples.");
	process.exit(0);
}

if (updated > 0) {
	bumpWatcherTrigger();
}
console.log(`\nDone. Updated ${updated} MDX file(s).`);
