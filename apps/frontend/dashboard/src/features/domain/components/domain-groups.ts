import { getDomain, getDomainWithoutSuffix } from "tldts";

/** Registrable root of a hostname: mail.acme.co.uk → acme.co.uk. */
export function rootDomainOf(hostname: string): string {
	const host = hostname.trim().toLowerCase().replace(/\.$/, "");
	return getDomain(host, { allowPrivateDomains: false }) ?? host;
}

/** Group label without the public suffix: acme.com → acme, acme.co.uk → acme. */
export function groupLabelOf(root: string): string {
	return getDomainWithoutSuffix(root, { allowPrivateDomains: false }) || root;
}

export type DomainGroupItem<T> =
	/** A domain with no siblings on this page. */
	| { kind: "single"; item: T }
	/**
	 * Two or more domains under one root. `parent` is the root domain itself
	 * when it was added; otherwise the group gets a header row.
	 */
	| { kind: "group"; root: string; parent: T | null; children: T[] };

/**
 * Groups items by root domain, keeping the order in which each root first
 * appears. Roots with a single domain stay ungrouped.
 */
export function groupByRootDomain<T>(
	items: T[],
	hostnameOf: (item: T) => string,
): DomainGroupItem<T>[] {
	const byRoot = new Map<string, T[]>();
	for (const item of items) {
		const root = rootDomainOf(hostnameOf(item));
		const list = byRoot.get(root);
		if (list) list.push(item);
		else byRoot.set(root, [item]);
	}

	const out: DomainGroupItem<T>[] = [];
	for (const [root, list] of byRoot) {
		if (list.length === 1 && list[0]) {
			out.push({ kind: "single", item: list[0] });
			continue;
		}
		const parent =
			list.find((item) => hostnameOf(item).trim().toLowerCase() === root) ??
			null;
		out.push({
			kind: "group",
			root,
			parent,
			children: list.filter((item) => item !== parent),
		});
	}
	return out;
}
