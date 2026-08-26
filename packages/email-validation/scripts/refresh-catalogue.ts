import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DOMAIN_SOURCES = [
	"https://raw.githubusercontent.com/BillionVerify/disposable/main/data/domains.txt",
	"https://raw.githubusercontent.com/kslr/disposable-email-domains/master/list.txt",
	"https://raw.githubusercontent.com/wesbos/burner-email-providers/master/emails.txt",
	"https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf",
];

const WILDCARD_SOURCES = [
	"https://raw.githubusercontent.com/BillionVerify/disposable/main/data/wildcards.txt",
];

const EXCEPTION_SOURCES = [
	"https://raw.githubusercontent.com/BillionVerify/disposable/main/data/exceptions.txt",
];

const REQUEST_TIMEOUT_MS = 20_000;
const MIN_DOMAINS_THRESHOLD = 150_000;

const dryRun = process.argv.includes("--dry-run");

function localPath(name: string): string {
	return fileURLToPath(new URL(`../data/upstream/${name}`, import.meta.url));
}

function normalizeEntry(line: string): string {
	let entry = line.trim().toLowerCase();
	if (entry.startsWith("@")) entry = entry.slice(1);
	return entry;
}

async function fetchSource(url: string): Promise<Set<string>> {
	const entries = new Set<string>();
	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});

		if (!response.ok) {
			console.warn(`⚠️ ${url}: HTTP ${response.status}`);
			return entries;
		}

		const contents = await response.text();
		for (const line of contents.split("\n")) {
			const entry = normalizeEntry(line);
			if (entry.length > 0 && !entry.startsWith("#")) {
				entries.add(entry);
			}
		}
	} catch (error) {
		console.warn(`⚠️ ${url}: request failed — ${String(error)}`);
	}
	return entries;
}

async function aggregateSources(urls: string[]): Promise<Set<string>> {
	const combined = new Set<string>();
	const results = await Promise.all(urls.map((u) => fetchSource(u)));
	for (const set of results) {
		for (const item of set) {
			combined.add(item);
		}
	}
	return combined;
}

function readExisting(name: string): Set<string> {
	try {
		const contents = readFileSync(localPath(name), "utf8");
		const entries = new Set<string>();
		for (const line of contents.split("\n")) {
			const entry = normalizeEntry(line);
			if (entry.length > 0 && !entry.startsWith("#")) entries.add(entry);
		}
		return entries;
	} catch {
		return new Set();
	}
}

function sample(values: string[], limit = 5): string {
	const shown = values.slice(0, limit).join(", ");
	return values.length > limit
		? `${shown}, +${values.length - limit} more`
		: shown;
}

console.log("Fetching and aggregating multi-source disposable datasets...");

const [nextDomains, nextWildcards, nextExceptions] = await Promise.all([
	aggregateSources(DOMAIN_SOURCES),
	aggregateSources(WILDCARD_SOURCES),
	aggregateSources(EXCEPTION_SOURCES),
]);

if (nextDomains.size < MIN_DOMAINS_THRESHOLD) {
	console.error(
		`\n✗ domains.txt: only ${nextDomains.size} entries, expected at least ${MIN_DOMAINS_THRESHOLD} — refusing to overwrite`,
	);
	process.exit(1);
}

function localDataPath(name: string): string {
	return fileURLToPath(new URL(`../data/local/${name}`, import.meta.url));
}

function readLocalList(name: string): Set<string> {
	try {
		const contents = readFileSync(localDataPath(name), "utf8");
		const entries = new Set<string>();
		for (const line of contents.split("\n")) {
			const entry = normalizeEntry(line);
			if (entry.length > 0 && !entry.startsWith("#")) entries.add(entry);
		}
		return entries;
	} catch {
		return new Set();
	}
}

const localExceptions = readLocalList("exceptions.txt");
const localFreeProviders = readLocalList("free-providers.txt");

// Filter out known free providers and local exceptions from disposable domains
for (const domain of localFreeProviders) {
	nextDomains.delete(domain);
}
for (const domain of localExceptions) {
	nextDomains.delete(domain);
}

const datasets = [
	{ name: "domains.txt", next: nextDomains },
	{ name: "wildcards.txt", next: nextWildcards },
	{ name: "exceptions.txt", next: nextExceptions },
] as const;

let changed = false;

for (const { name, next } of datasets) {
	const previous = readExisting(name);
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

	if (!dryRun) {
		const sortedList = [...next].sort().join("\n") + "\n";
		writeFileSync(localPath(name), sortedList, "utf8");
	}
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
