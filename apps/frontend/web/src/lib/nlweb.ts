import {
	loadMarketingCorpus,
	type SearchablePage,
} from "@reloop/web/lib/agent-content";
import { getSiteUrl } from "@reloop/web/lib/site";

export const NLWEB_VERSION = "0.55";

export type NlwebItem = {
	"@type": "WebPage" | "SearchSummary";
	name?: string;
	url?: string;
	description?: string;
	text?: string;
	grounding?: { source: string };
};

let corpus: SearchablePage[] | null = null;

function marketingCorpus(): SearchablePage[] {
	corpus ??= loadMarketingCorpus();
	return corpus;
}

// "reloop" appears on every page, so it carries no signal either
const STOPWORDS = new Set(
	"the and for with how what does can you are use using from that this have much why when which who where reloop".split(
		" ",
	),
);

const SYNONYMS: Record<string, string> = {
	cost: "pricing",
	costs: "pricing",
	price: "pricing",
	prices: "pricing",
};

function terms(query: string): string[] {
	return query
		.toLowerCase()
		.split(/[^a-z0-9.@-]+/)
		.filter((term) => term.length > 2 && !STOPWORDS.has(term))
		.flatMap((term) => (SYNONYMS[term] ? [term, SYNONYMS[term]!] : [term]));
}

function snippet(body: string, term: string | undefined): string {
	const flat = body.replace(/\s+/g, " ").trim();
	const at = term ? Math.max(0, flat.toLowerCase().indexOf(term) - 60) : 0;
	return flat.slice(at, at + 240).trim();
}

function searchMarketing(query: string, limit: number): NlwebItem[] {
	const site = getSiteUrl();
	const words = terms(query);
	if (words.length === 0) return [];

	return marketingCorpus()
		.map((page) => {
			const title = page.title.toLowerCase();
			const body = page.body.toLowerCase();
			let score = 0;
			for (const word of words) {
				if (title.includes(word)) score += 10;
				if (page.path.includes(word)) score += 5;
				score += Math.min(body.split(word).length - 1, 20);
			}
			return { page, score };
		})
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map(({ page }) => {
			const url = `${site}${page.path === "/" ? "" : page.path}`;
			return {
				"@type": "WebPage" as const,
				name: page.title,
				url,
				description: snippet(page.body, words[0]),
				grounding: { source: url },
			};
		});
}

type DocsHit = { title: string; url: string; snippet: string };

/** Docs live in a separate app; reuse its MCP `search_docs` tool rather than duplicating the index. */
async function searchDocs(query: string, limit: number): Promise<NlwebItem[]> {
	try {
		const res = await fetch(`${getSiteUrl()}/docs/mcp`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: 1,
				method: "tools/call",
				params: { name: "search_docs", arguments: { query, limit } },
			}),
			signal: AbortSignal.timeout(4000),
		});
		const rpc = (await res.json()) as {
			result?: { content?: Array<{ text?: string }> };
		};
		const text = rpc.result?.content?.[0]?.text;
		if (!text) return [];
		const { results } = JSON.parse(text) as { results: DocsHit[] };
		return results.map((hit) => ({
			"@type": "WebPage" as const,
			name: hit.title,
			url: hit.url,
			description: hit.snippet,
			grounding: { source: hit.url },
		}));
	} catch {
		return [];
	}
}

/** Answer an NLWeb `ask` against the marketing site and the docs. `site` narrows to one corpus. */
export async function ask(
	query: string,
	site: string | undefined,
	limit = 8,
): Promise<NlwebItem[]> {
	const wantDocs = !site || site.includes("docs");
	const wantSite = !site || !site.includes("docs");
	const keywords = terms(query).join(" ");
	if (!keywords) return [];
	const [marketing, docs] = await Promise.all([
		wantSite ? searchMarketing(query, limit) : [],
		wantDocs ? searchDocs(keywords, limit) : [],
	]);

	// Interleave so both corpora surface near the top
	const merged: NlwebItem[] = [];
	for (let i = 0; merged.length < limit && i < limit; i++) {
		if (docs[i]) merged.push(docs[i]!);
		if (marketing[i] && merged.length < limit) merged.push(marketing[i]!);
	}
	return merged;
}
