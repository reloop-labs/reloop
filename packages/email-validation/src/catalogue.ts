import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { DisposableMatch } from "./types";

function dataPath(relative: string): string {
	return fileURLToPath(new URL(`../data/${relative}`, import.meta.url));
}

function readList(relative: string): string[] {
	let contents: string;
	try {
		contents = readFileSync(dataPath(relative), "utf8");
	} catch {
		return [];
	}

	const entries: string[] = [];
	for (const line of contents.split("\n")) {
		const trimmed = line.trim().toLowerCase();
		if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
		entries.push(trimmed);
	}
	return entries;
}

function stripWildcardPrefix(entry: string): string {
	return entry.startsWith("*.") ? entry.slice(2) : entry;
}

export type Catalogue = {
	disposable: Set<string>;
	wildcards: Set<string>;
	allowlist: Set<string>;
	freeProviders: Set<string>;
	roleLocalParts: Set<string>;
};

let cached: Catalogue | null = null;

export function loadCatalogue(): Catalogue {
	if (cached) return cached;

	cached = {
		disposable: new Set(readList("upstream/domains.txt")),
		wildcards: new Set(
			[
				...readList("upstream/wildcards.txt"),
				...readList("local/wildcards.txt"),
			].map(stripWildcardPrefix),
		),
		allowlist: new Set([
			...readList("upstream/exceptions.txt"),
			...readList("local/exceptions.txt"),
		]),
		freeProviders: new Set(readList("local/free-providers.txt")),
		roleLocalParts: new Set(readList("local/role-local-parts.txt")),
	};

	return cached;
}

export function warmCatalogue(): { domains: number; wildcards: number } {
	const catalogue = loadCatalogue();
	return {
		domains: catalogue.disposable.size,
		wildcards: catalogue.wildcards.size,
	};
}

export function resetCatalogue(): void {
	cached = null;
}

function* suffixes(domain: string): Generator<string> {
	const labels = domain.split(".");
	for (let i = 0; i < labels.length; i++) {
		yield labels.slice(i).join(".");
	}
}

/**
 * Resolution order is exceptions → exact → wildcard, matching upstream's
 * contract. The allowlist wins outright: a domain listed there is never
 * reported as disposable, however it matches.
 */
export function matchDisposable(domain: string): {
	match: DisposableMatch | null;
	allowlisted: boolean;
} {
	const catalogue = loadCatalogue();

	if (catalogue.allowlist.has(domain)) {
		return { match: null, allowlisted: true };
	}

	if (catalogue.disposable.has(domain)) {
		return { match: { kind: "exact", domain }, allowlisted: false };
	}

	for (const suffix of suffixes(domain)) {
		if (catalogue.wildcards.has(suffix)) {
			return {
				match: { kind: "wildcard", domain, pattern: `*.${suffix}` },
				allowlisted: false,
			};
		}
	}

	return { match: null, allowlisted: false };
}

export function isFreeProvider(domain: string): boolean {
	return loadCatalogue().freeProviders.has(domain);
}

export function isRoleLocalPart(localPart: string): boolean {
	return loadCatalogue().roleLocalParts.has(localPart);
}
