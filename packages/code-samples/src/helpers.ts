import { LANGUAGE_META } from "./languages";
import type { CodeSample } from "./types";

export function sampleById(
	samples: readonly CodeSample[],
	id: string,
): CodeSample | undefined {
	return samples.find((s) => s.id === id);
}

export function filterLanguages(
	samples: readonly CodeSample[],
	ids: readonly string[],
): CodeSample[] {
	const order = new Map(ids.map((id, i) => [id, i]));
	return samples
		.filter((s) => order.has(s.id))
		.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export function parseCurlMeta(curlSource: string): {
	method: string;
	endpoint: string;
} {
	const method = (curlSource.match(/-X\s+(\w+)/i)?.[1] ?? "GET").toUpperCase();
	const urlMatch = curlSource.match(/https?:\/\/[^\s"'\\]+/);
	if (!urlMatch) {
		throw new Error("Could not parse URL from curl sample");
	}
	const raw = urlMatch[0].replace(/\\$/g, "");
	const pathname = new URL(raw.split("?")[0]!).pathname;
	return { method, endpoint: pathname };
}

/**
 * Dashboard shape: codeExamples[langKey][opId] = source string
 *
 * @param langIds - package sample ids (`node`, `python`, …)
 * @param langKeyOverrides - map sample id → drawer language key
 *   (e.g. `{ node: "javascript" }` when the drawer uses `javascript` instead of `nodejs`)
 */
export function toDashboardCodeExamples(
	ops: Array<{ id: string; samples: readonly CodeSample[] }>,
	langIds: readonly string[],
	langKeyOverrides?: Readonly<Record<string, string>>,
): Record<string, Record<string, string>> {
	const out: Record<string, Record<string, string>> = {};
	for (const langId of langIds) {
		const meta = LANGUAGE_META[langId];
		const langKey = langKeyOverrides?.[langId] ?? meta?.langKey ?? langId;
		out[langKey] = {};
		for (const op of ops) {
			const sample = sampleById(op.samples, langId);
			if (sample) {
				out[langKey][op.id] = sample.source;
			}
		}
	}
	return out;
}
