#!/usr/bin/env bun
/**
 * Syncs MDX API doc codeSamples from local backend x-codeSamples.ts files.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const REPO_ROOT = path.resolve(__dirname, "../../../..");

interface CodeSample {
	id: string;
	lang: string;
	label: string;
	source: string;
}

interface OperationRef {
	method: string;
	path: string;
}

const BACKEND_ROUTE_DIRS = [
	path.join(REPO_ROOT, "apps/backend/contacts/src/routes"),
	path.join(REPO_ROOT, "apps/backend/api-key/src/routes"),
];

const DOCS_DIRS = [
	path.join(REPO_ROOT, "apps/frontend/docs/content/docs/api/contacts"),
	path.join(REPO_ROOT, "apps/frontend/docs/content/docs/api/api-key"),
];

function walkFiles(dir: string, ext: string, results: string[] = []): string[] {
	if (!fs.existsSync(dir)) return results;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) walkFiles(fullPath, ext, results);
		else if (entry.name.endsWith(ext)) results.push(fullPath);
	}
	return results;
}

function normalizeApiPath(urlPath: string): string {
	if (urlPath.startsWith("/api-key/")) {
		return `/api${urlPath}`;
	}
	return urlPath;
}

function parseCurlSample(source: string): { method: string; path: string } | null {
	const methodMatch = source.match(
		/curl\s+(?:-X\s+(\w+)\s+)?["']?(https?:\/\/[^/\s"']+)(\/[^?\s"']*)?/i,
	);
	if (!methodMatch) return null;

	const method = (methodMatch[1] || "GET").toUpperCase();
	const urlPath = normalizeApiPath(methodMatch[3] || "/");

	return { method, path: urlPath.split("?")[0] || "/" };
}

function openApiPathToRegex(openApiPath: string): RegExp {
	const escaped = openApiPath
		.replace(/[.*+?^${}()|[\]\\]/g, (char) => `\\${char}`)
		.replace(/\\\{[^}]+\\\}/g, "[^/]+");

	return new RegExp(`^${escaped}$`);
}

async function loadSamplesByOperation(): Promise<Map<string, CodeSample[]>> {
	const map = new Map<string, CodeSample[]>();
	const sampleFiles = BACKEND_ROUTE_DIRS.flatMap((dir) =>
		walkFiles(dir, ".x-codeSamples.ts"),
	);

	for (const file of sampleFiles) {
		const mod = await import(file);
		const samples = Object.values(mod).find(
			(value): value is CodeSample[] =>
				Array.isArray(value) &&
				value.length > 0 &&
				typeof value[0] === "object" &&
				value[0] !== null &&
				"id" in value[0],
		);

		if (!samples) continue;

		const curl = samples.find((sample) => sample.id === "curl");
		if (!curl) continue;

		const parsed = parseCurlSample(curl.source);
		if (!parsed) continue;

		map.set(`${parsed.method}:${parsed.path}`, samples);
	}

	return map;
}

function findSamplesForOperation(
	samplesByCurlPath: Map<string, CodeSample[]>,
	operation: OperationRef,
): CodeSample[] | undefined {
	const directKey = `${operation.method.toUpperCase()}:${operation.path}`;
	if (samplesByCurlPath.has(directKey)) {
		return samplesByCurlPath.get(directKey);
	}

	const regex = openApiPathToRegex(operation.path);
	for (const [key, samples] of samplesByCurlPath) {
		const [method, curlPath] = key.split(":");
		if (method !== operation.method.toUpperCase()) continue;
		if (curlPath && regex.test(curlPath)) return samples;
	}

	return undefined;
}

function collectMdxFiles(serviceFilter?: string): string[] {
	return DOCS_DIRS.flatMap((dir) => walkFiles(dir, ".mdx")).filter((file) => {
		if (!serviceFilter) return true;
		return file.includes(`/api/${serviceFilter}/`);
	});
}

async function main() {
	const serviceFilter = process.argv[2];
	const samplesByCurlPath = await loadSamplesByOperation();
	const mdxFiles = collectMdxFiles(serviceFilter);

	let updated = 0;
	let missing = 0;

	for (const file of mdxFiles) {
		const raw = fs.readFileSync(file, "utf8");
		const { data, content } = matter(raw);
		const apiData = data._apiData as
			| { operationData?: OperationRef[]; codeSamples?: CodeSample[] }
			| undefined;

		if (!apiData?.operationData?.[0]) continue;

		const operation = apiData.operationData[0];
		const samples = findSamplesForOperation(samplesByCurlPath, operation);

		if (!samples) {
			console.warn(
				`⚠️  No samples for ${operation.method.toUpperCase()} ${operation.path} (${path.basename(file)})`,
			);
			missing++;
			continue;
		}

		const next = {
			...data,
			_apiData: {
				...apiData,
				codeSamples: samples,
			},
		};

		const serialized = matter.stringify(content, next);
		if (serialized !== raw) {
			fs.writeFileSync(file, serialized);
			updated++;
			console.log(`✅ ${path.relative(REPO_ROOT, file)}`);
		}
	}

	console.log(`\nDone. Updated ${updated} files, ${missing} without matching samples.`);

	const triggerFile = path.join(
		REPO_ROOT,
		"apps/frontend/docs/src/lib/watcher-trigger.ts",
	);
	fs.writeFileSync(triggerFile, `export const timestamp = ${Date.now()};\n`, "utf8");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
