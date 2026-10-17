/**
 * spamhaus-dbl.ts — block sending from domains on the Spamhaus DBL.
 *
 * Runs when a domain is added, on every verification (dashboard click and
 * background worker), and when a relay domain goes live. A spam, phish,
 * malware or botnet listing blocks sending through the admin block columns
 * with source "spamhaus"; a later clean answer lifts only that block, never
 * one an admin placed.
 *
 * Fail-open: timeouts, refused queries and RFC 5782 error codes leave the
 * domain as it is. "Abused legit" codes (127.0.1.1xx) mean a compromised
 * legitimate domain and do not block.
 *
 * Spamhaus refuses public resolvers (8.8.8.8, 1.1.1.1), so this uses the
 * system resolver, or Spamhaus DQS when SPAMHAUS_DQS_KEY is set.
 */

import { Resolver } from "node:dns/promises";
import { isLocal } from "@reloop/dns/is-local";
import { eq } from "drizzle-orm";
import { getDomain } from "tldts";
import { type DatabaseInstance, db as defaultDb } from "./client";
import { domain as domainTable } from "./schema/domain";

export type DblCategory = "spam" | "phish" | "malware" | "botnet";

export type DblLookup =
	| { status: "listed"; name: string; categories: DblCategory[] }
	| { status: "clean" }
	| { status: "error"; error: string };

const LISTING_CODES: Record<string, DblCategory> = {
	"127.0.1.2": "spam",
	"127.0.1.4": "phish",
	"127.0.1.5": "malware",
	"127.0.1.6": "botnet",
};

const QUERY_TIMEOUT_MS = 2500;
const DELIST_URL = "https://check.spamhaus.org";

export function dblZone(dqsKey = process.env.SPAMHAUS_DQS_KEY): string {
	const key = dqsKey?.trim();
	return key ? `${key}.dbl.dq.spamhaus.net` : "dbl.spamhaus.org";
}

/** The sending name plus its registrable domain (send.example.com → example.com). */
export function dblQueryNames(domainName: string): string[] {
	const name = domainName.trim().toLowerCase().replace(/\.$/, "");
	const registrable = getDomain(name);
	return [...new Set([name, registrable].filter((n): n is string => !!n))];
}

/**
 * Interprets DBL A records. Unknown 127.0.1.x codes and abused-legit codes
 * are not listings; 127.255.255.x and 127.0.1.255 are query errors.
 */
export function classifyDblAnswer(addresses: string[]):
	| { status: "listed"; categories: DblCategory[] }
	| { status: "clean" }
	| {
			status: "error";
			error: string;
	  } {
	const categories = [
		...new Set(
			addresses
				.map((code) => LISTING_CODES[code])
				.filter((c): c is DblCategory => !!c),
		),
	];
	if (categories.length > 0) return { status: "listed", categories };
	const errorCode = addresses.find(
		(code) => code.startsWith("127.255.255.") || code === "127.0.1.255",
	);
	if (errorCode) {
		return {
			status: "error",
			error:
				errorCode === "127.255.255.254"
					? "Spamhaus refused the resolver (127.255.255.254); use a non-public resolver or SPAMHAUS_DQS_KEY"
					: `Spamhaus returned error code ${errorCode}`,
		};
	}
	return { status: "clean" };
}

function createDblResolver(): Resolver {
	const resolver = new Resolver({ timeout: QUERY_TIMEOUT_MS, tries: 1 });
	const servers = (process.env.DNSBL_RESOLVERS ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	if (servers.length > 0) resolver.setServers(servers);
	return resolver;
}

const dblResolver = createDblResolver();

function isNxdomain(error: unknown): boolean {
	const code = (error as { code?: string })?.code;
	return code === "ENOTFOUND" || code === "ENODATA";
}

async function resolveWithDeadline(
	resolver: Pick<Resolver, "resolve4">,
	name: string,
): Promise<string[]> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			resolver.resolve4(name),
			new Promise<never>((_, reject) => {
				timer = setTimeout(
					() => reject(new Error("Spamhaus DBL query timed out")),
					QUERY_TIMEOUT_MS,
				);
			}),
		]);
	} finally {
		clearTimeout(timer);
	}
}

export async function lookupSpamhausDbl(
	domainName: string,
	options: { resolver?: Pick<Resolver, "resolve4">; zone?: string } = {},
): Promise<DblLookup> {
	if (isLocal(domainName)) return { status: "clean" };
	const resolver = options.resolver ?? dblResolver;
	const zone = options.zone ?? dblZone();

	const answers = await Promise.all(
		dblQueryNames(domainName).map(async (name) => {
			try {
				const addresses = await resolveWithDeadline(
					resolver,
					`${name}.${zone}`,
				);
				return { name, ...classifyDblAnswer(addresses) };
			} catch (error) {
				if (isNxdomain(error)) return { name, status: "clean" as const };
				return {
					name,
					status: "error" as const,
					error: error instanceof Error ? error.message : String(error),
				};
			}
		}),
	);

	const listed = answers.find((a) => a.status === "listed");
	if (listed && listed.status === "listed") {
		return {
			status: "listed",
			name: listed.name,
			categories: listed.categories,
		};
	}
	const failed = answers.find((a) => a.status === "error");
	if (failed && failed.status === "error") {
		return { status: "error", error: failed.error };
	}
	return { status: "clean" };
}

const CATEGORY_LABEL: Record<DblCategory, string> = {
	spam: "a spam domain",
	phish: "a phishing domain",
	malware: "a malware domain",
	botnet: "a botnet domain",
};

/** Customer-facing block message for a DBL listing. */
export function dblBlockMessage(
	listing: Extract<DblLookup, { status: "listed" }>,
): string {
	const label = listing.categories.map((c) => CATEGORY_LABEL[c]).join(" and ");
	return `Spamhaus lists ${listing.name} on its Domain Block List as ${label}. Request removal at ${DELIST_URL}, then verify the domain again to restore sending.`;
}

export type DblCheckOutcome =
	| "blocked"
	| "unblocked"
	| "unchanged"
	| "lookup_failed";

/**
 * Look the domain up on the DBL and apply or lift its Spamhaus block.
 * Never throws: a failed lookup or write returns "lookup_failed" so callers
 * (domain creation, verification) carry on.
 */
export async function applySpamhausDblCheck(
	{ domainId, domainName }: { domainId: string; domainName: string },
	options: {
		database?: DatabaseInstance;
		lookup?: (name: string) => Promise<DblLookup>;
	} = {},
): Promise<{ outcome: DblCheckOutcome; lookup: DblLookup | null }> {
	const database = options.database ?? defaultDb;
	const lookup = options.lookup ?? ((name: string) => lookupSpamhausDbl(name));
	try {
		const result = await lookup(domainName);
		if (result.status === "error") {
			return { outcome: "lookup_failed", lookup: result };
		}

		const row = await database.query.domain.findFirst({
			where: eq(domainTable.id, domainId),
			columns: {
				sendingBlockedAt: true,
				sendingBlockedMessage: true,
				sendingBlockedSource: true,
			},
		});
		if (!row) return { outcome: "unchanged", lookup: result };

		if (result.status === "listed") {
			// An admin block outranks the automatic one; leave it alone.
			if (row.sendingBlockedAt && row.sendingBlockedSource !== "spamhaus") {
				return { outcome: "unchanged", lookup: result };
			}
			const message = dblBlockMessage(result);
			if (row.sendingBlockedAt && row.sendingBlockedMessage === message) {
				return { outcome: "unchanged", lookup: result };
			}
			await database
				.update(domainTable)
				.set({
					sendingBlockedAt: row.sendingBlockedAt ?? new Date(),
					sendingBlockedMessage: message,
					sendingBlockedSource: "spamhaus",
				})
				.where(eq(domainTable.id, domainId));
			return { outcome: "blocked", lookup: result };
		}

		if (row.sendingBlockedAt && row.sendingBlockedSource === "spamhaus") {
			await database
				.update(domainTable)
				.set({
					sendingBlockedAt: null,
					sendingBlockedMessage: null,
					sendingBlockedSource: null,
				})
				.where(eq(domainTable.id, domainId));
			return { outcome: "unblocked", lookup: result };
		}
		return { outcome: "unchanged", lookup: result };
	} catch (error) {
		return {
			outcome: "lookup_failed",
			lookup: {
				status: "error",
				error: error instanceof Error ? error.message : String(error),
			},
		};
	}
}
