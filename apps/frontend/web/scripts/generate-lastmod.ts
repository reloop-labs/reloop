/**
 * Map each page directory under src/app to the date it last changed in git,
 * for sitemap <lastmod>. A changed file counts toward the nearest directory
 * above it that has a page. Docker builds have no .git, so the JSON is
 * committed and this script keeps the existing file when git is unavailable.
 * Run: bun run generate:lastmod
 */
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
const appDir = join(root, "src/app");
const out = join(root, "src/generated/lastmod.json");

let log: string;
let repoRoot: string;
try {
	log = execFileSync(
		"git",
		["log", "--format=@%cs", "--name-only", "--", appDir],
		{ cwd: root, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 },
	);
	repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
		cwd: root,
		encoding: "utf-8",
	}).trim();
} catch {
	console.warn("  git history unavailable; keeping src/generated/lastmod.json");
	process.exit(0);
}

const hasPage = (dir: string) =>
	existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "page.ts"));

function owningPageDir(file: string): string | null {
	let dir = dirname(file);
	while (dir.startsWith(appDir)) {
		if (hasPage(dir)) return relative(appDir, dir);
		dir = dirname(dir);
	}
	return null;
}

// git log is newest-first, so the first date seen per page is its latest change
const dates: Record<string, string> = {};
let date = "";
for (const line of log.split("\n")) {
	if (line.startsWith("@")) {
		date = line.slice(1);
		continue;
	}
	if (!line) continue;
	const file = join(repoRoot, line);
	if (!existsSync(file)) continue;
	const page = owningPageDir(file);
	if (page !== null) dates[page] ??= date;
}

const sorted = Object.fromEntries(
	Object.entries(dates).sort(([a], [b]) => a.localeCompare(b)),
);
writeFileSync(out, `${JSON.stringify(sorted, null, "\t")}\n`);
console.log(
	`  wrote src/generated/lastmod.json (${Object.keys(sorted).length} pages)`,
);
