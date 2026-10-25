/**
 * Map each docs page slug to the date its MDX file last changed in git, for
 * sitemap <lastmod>. Docker builds have no .git, so the JSON is committed and
 * this script keeps the existing file when git history is unavailable.
 * Run: bun run generate:lastmod
 */
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
const contentDir = join(root, "content/docs");
const out = join(root, "src/generated/lastmod.json");

let log: string;
try {
	log = execFileSync(
		"git",
		["log", "--format=@%cs", "--name-only", "--", contentDir],
		{ cwd: root, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 },
	);
} catch {
	console.warn("  git history unavailable; keeping src/generated/lastmod.json");
	process.exit(0);
}

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
	cwd: root,
	encoding: "utf-8",
}).trim();

// git log is newest-first, so the first date seen per file is its latest change
const dates: Record<string, string> = {};
let date = "";
for (const line of log.split("\n")) {
	if (line.startsWith("@")) {
		date = line.slice(1);
		continue;
	}
	if (!line.endsWith(".mdx") || !existsSync(join(repoRoot, line))) continue;
	const slug = relative(contentDir, join(repoRoot, line))
		.replace(/\.mdx$/, "")
		.replace(/(^|\/)index$/, "");
	if (slug.startsWith("..")) continue;
	dates[slug] ??= date;
}

const sorted = Object.fromEntries(
	Object.entries(dates).sort(([a], [b]) => a.localeCompare(b)),
);
writeFileSync(out, `${JSON.stringify(sorted, null, "\t")}\n`);
console.log(
	`  wrote src/generated/lastmod.json (${Object.keys(sorted).length} pages)`,
);
