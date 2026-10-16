import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull, like, ne, or } from "drizzle-orm";

export const TEMPLATE_SLUG_MAX_LENGTH = 128;
export const TEMPLATE_SLUG_PATTERN = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
const SLUG_RE = new RegExp(TEMPLATE_SLUG_PATTERN);

/** Room left for a `-N` suffix so generated slugs never exceed the column. */
const BASE_MAX_LENGTH = TEMPLATE_SLUG_MAX_LENGTH - 8;

/** "Welcome Email 🎉" → "welcome-email" */
export function toTemplateSlug(name: string): string {
	const slug = name
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.slice(0, BASE_MAX_LENGTH)
		.replace(/^-+|-+$/g, "");
	return slug || "template";
}

export function isValidTemplateSlug(slug: string): boolean {
	return slug.length <= TEMPLATE_SLUG_MAX_LENGTH && SLUG_RE.test(slug);
}

/** True when `slug` is `base` or `base-N`, i.e. still the generated one. */
export function isGeneratedSlugFor(slug: string, name: string): boolean {
	const base = toTemplateSlug(name);
	return slug === base || new RegExp(`^${base}-\\d+$`).test(slug);
}

export async function isTemplateSlugTaken(
	organizationId: string,
	slug: string,
	excludeTemplateId?: string,
): Promise<boolean> {
	const [row] = await db
		.select({ id: schema.template.id })
		.from(schema.template)
		.where(
			and(
				eq(schema.template.organizationId, organizationId),
				eq(schema.template.slug, slug),
				isNull(schema.template.deletedAt),
				excludeTemplateId
					? ne(schema.template.id, excludeTemplateId)
					: undefined,
			),
		)
		.limit(1);
	return !!row;
}

/**
 * First free slug for `name` in the org: `welcome-email`, then
 * `welcome-email-2`, `-3`, … The unique index is the real guarantee; callers
 * retry on a unique violation when two creates race.
 */
export async function uniqueTemplateSlug(
	organizationId: string,
	name: string,
	excludeTemplateId?: string,
): Promise<string> {
	const base = toTemplateSlug(name);
	const rows = await db
		.select({ slug: schema.template.slug })
		.from(schema.template)
		.where(
			and(
				eq(schema.template.organizationId, organizationId),
				isNull(schema.template.deletedAt),
				or(
					eq(schema.template.slug, base),
					like(schema.template.slug, `${base}-%`),
				),
				excludeTemplateId
					? ne(schema.template.id, excludeTemplateId)
					: undefined,
			),
		);

	const taken = new Set(rows.map((r) => r.slug));
	if (!taken.has(base)) return base;
	let n = 2;
	while (taken.has(`${base}-${n}`)) n++;
	return `${base}-${n}`;
}

export function isTemplateSlugConflict(error: unknown): boolean {
	const e = error as { code?: string; constraint?: string; cause?: unknown };
	if (e?.code === "23505" && e.constraint === "template_unique_org_slug") {
		return true;
	}
	return e?.cause ? isTemplateSlugConflict(e.cause) : false;
}
