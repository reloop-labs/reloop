/**
 * Rewrites `data/upstream/` only. Reloop's curation in `data/local/` is never
 * touched: a refresh must never silently drop an allowlist entry we added for
 * a real customer.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const UPSTREAM =
	"https://raw.githubusercontent.com/BillionVerify/disposable/main/data";

const FILES = ["domains.txt", "wildcards.txt", "exceptions.txt"] as const;

const REQUEST_TIMEOUT_MS = 15_000;

const MIN_LINES: Record<(typeof FILES)[number], number> = {
	"domains.txt": 100_000,
	"wildcards.txt": 0,
	"exceptions.txt": 0,
};

const dryRun = process.argv.includes("--dry-run");

function localPath(name: string): string {
	return fileURLToPath(new URL(`../data/upstream/${name}`, import.meta.url));
}

function entriesOf(contents: string): Set<string> {
	const entries = new Set<string>();
	for (const line of contents.split("\n")) {
		const trimmed = line.trim().toLowerCase();
		if (trimmed.length > 0 && !trimmed.startsWith("#")) entries.add(trimmed);
	}
	return entries;
}

function readExisting(name: string): string {
	try {
		return readFileSync(localPath(name), "utf8");
	} catch {
		return "";
	}
}

function sample(values: string[], limit = 5): string {
	const shown = values.slice(0, limit).join(", ");
	return values.length > limit
		? `${shown}, +${values.length - limit} more`
		: shown;
}

let failed = false;
let changed = false;

for (const name of FILES) {
	const url = `${UPSTREAM}/${name}`;

	// The signal covers the body read, so text() must stay inside this try.
	let contents: string;
	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});

		if (!response.ok) {
			console.error(`✗ ${name}: HTTP ${response.status} from ${url}`);
			failed = true;
			continue;
		}

		contents = await response.text();
	} catch (error) {
		console.error(`✗ ${name}: request failed — ${String(error)}`);
		failed = true;
		continue;
	}

	const next = entriesOf(contents);

	if (next.size < MIN_LINES[name]) {
		console.error(
			`✗ ${name}: only ${next.size} entries, expected at least ${MIN_LINES[name]} — refusing to overwrite`,
		);
		failed = true;
		continue;
	}

	const previous = entriesOf(readExisting(name));
	const added = [...next].filter((entry) => !previous.has(entry)).sort();
	const removed = [...previous].filter((entry) => !next.has(entry)).sort();

	if (added.length === 0 && removed.length === 0) {
		console.log(`= ${name}: unchanged (${next.size} entries)`);
		continue;
	}

	changed = true;
	console.log(
		`${dryRun ? "~" : "✓"} ${name}: ${next.size} entries (+${added.length} / -${removed.length})`,
	);
	if (added.length > 0) console.log(`    added:   ${sample(added)}`);
	if (removed.length > 0) console.log(`    removed: ${sample(removed)}`);

	if (!dryRun) writeFileSync(localPath(name), contents, "utf8");
}

if (failed) {
	console.error("\nRefresh incomplete — some files were left untouched.");
	process.exit(1);
}

if (dryRun) {
	console.log(changed ? "\nDry run — nothing written." : "\nUp to date.");
} else {
	console.log(
		changed
			? "\nCatalogue updated. Review the diff and commit data/upstream/."
			: "\nAlready up to date.",
	);
}
