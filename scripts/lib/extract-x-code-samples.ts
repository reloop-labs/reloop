import fs from "node:fs";
import path from "node:path";

export interface CodeSample {
	id: string;
	lang: string;
	label: string;
	source: string;
}

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
		if (entry.name.endsWith(".x-codeSamples.ts")) {
			files.push(fullPath);
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
