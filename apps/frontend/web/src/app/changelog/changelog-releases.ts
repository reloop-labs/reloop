import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ChangelogRelease } from "./changelog-types";

function getChangelogDir(): string {
	const primary = path.join(
		process.cwd(),
		"apps/frontend/web/content/changelog",
	);
	if (fs.existsSync(primary)) {
		return primary;
	}
	return path.join(process.cwd(), "content/changelog");
}

function getAllMdxFiles(dirPath: string): string[] {
	if (!fs.existsSync(dirPath)) return [];
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	let files: string[] = [];
	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			files = files.concat(getAllMdxFiles(fullPath));
		} else if (entry.isFile() && entry.name.endsWith(".mdx")) {
			files.push(fullPath);
		}
	}
	return files;
}

export function loadChangelogReleases(): Omit<
	ChangelogRelease,
	"preview" | "code"
>[] {
	const dirPath = getChangelogDir();
	const files = getAllMdxFiles(dirPath);

	const releases: Omit<ChangelogRelease, "preview" | "code">[] = [];

	for (const filePath of files) {
		try {
			const rawContent = fs.readFileSync(filePath, "utf8");
			const { data, content } = matter(rawContent);
			releases.push({
				slug: String(data.slug || path.basename(filePath, ".mdx")),
				version: String(data.version || ""),
				date: String(data.date || ""),
				...(data.launchDate ? { launchDate: String(data.launchDate) } : {}),
				title: String(data.title || ""),
				description: String(data.description || ""),
				tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
				markdown: content.trim(),
			});
		} catch (err) {
			console.error(`Failed to load changelog MDX file: ${filePath}`, err);
		}
	}

	return releases.sort((a, b) =>
		b.version.localeCompare(a.version, undefined, { numeric: true }),
	);
}

export const changelogReleasesData = loadChangelogReleases();
