import * as schema from "@reloop/db/schema";
import { asc, desc, type SQL } from "drizzle-orm";

export const API_KEY_SORT_FIELDS = [
	"name",
	"prefix",
	"lastUsed",
	"status",
	"createdAt",
] as const;

export type ApiKeySortField = (typeof API_KEY_SORT_FIELDS)[number];
export type ApiKeySortOrder = "asc" | "desc";

export type ApiKeySortRule = {
	field: ApiKeySortField;
	order: ApiKeySortOrder;
};

export const DEFAULT_API_KEY_SORT: ApiKeySortRule[] = [
	{ field: "createdAt", order: "desc" },
];

const SORT_FIELD_SET = new Set<string>(API_KEY_SORT_FIELDS);

const COLUMN_MAP = {
	name: schema.apikey.name,
	prefix: schema.apikey.start,
	lastUsed: schema.apikey.lastRequest,
	status: schema.apikey.enabled,
	createdAt: schema.apikey.createdAt,
} as const;

export function parseApiKeySort(sort: string | undefined): ApiKeySortRule[] {
	if (!sort || sort.trim() === "") {
		return DEFAULT_API_KEY_SORT;
	}

	const rules: ApiKeySortRule[] = [];
	const seen = new Set<ApiKeySortField>();

	for (const token of sort.split(",")) {
		const [rawField, rawOrder] = token.split(":");
		if (!rawField || !rawOrder) continue;
		if (!SORT_FIELD_SET.has(rawField)) continue;
		if (rawOrder !== "asc" && rawOrder !== "desc") continue;

		const field = rawField as ApiKeySortField;
		if (seen.has(field)) continue;
		seen.add(field);
		rules.push({ field, order: rawOrder });
	}

	return rules.length > 0 ? rules : DEFAULT_API_KEY_SORT;
}

export function toApiKeyOrderBy(rules: ApiKeySortRule[]): SQL[] {
	const sqls = rules.map((rule) => {
		const column = COLUMN_MAP[rule.field];
		return rule.order === "asc" ? asc(column) : desc(column);
	});
	// Always append id as a secondary tie-breaker for stable, deterministic ordering across row updates/rotations
	sqls.push(desc(schema.apikey.id));
	return sqls;
}
