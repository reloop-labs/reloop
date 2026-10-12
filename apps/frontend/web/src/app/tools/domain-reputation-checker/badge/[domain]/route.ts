import { cacheLife } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { normalizeBadgeDomain, renderBadge } from "../../badge";
import type { DomainReputationResponse } from "../../check-api";

const API_URL = `${(process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "")}/api/tools/v1/domain-reputation`;

/**
 * One API call per domain per day, however many pages embed the badge.
 * Throws on failure so a rate-limited or failed lookup is never cached.
 */
async function lookupGrade(domain: string) {
	"use cache";
	cacheLife("days");
	const response = await fetch(
		`${API_URL}?domain=${encodeURIComponent(domain)}`,
	);
	if (!response.ok)
		throw new Error(`Reputation lookup failed: ${response.status}`);
	const { grade, score } = (await response.json()) as DomainReputationResponse;
	return { grade, score };
}

export async function GET(
	_request: NextRequest,
	props: { params: Promise<{ domain: string }> },
) {
	const { domain: raw } = await props.params;
	const domain = normalizeBadgeDomain(raw);

	let result: Awaited<ReturnType<typeof lookupGrade>> | null = null;
	if (domain) {
		try {
			result = await lookupGrade(domain);
		} catch {
			// Falls through to the neutral "unknown" badge.
		}
	}

	return new NextResponse(renderBadge(result), {
		status: domain ? 200 : 400,
		headers: {
			"Content-Type": "image/svg+xml; charset=utf-8",
			// Short CDN life for failures so a transient error clears quickly.
			"Cache-Control": result
				? "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
				: "public, max-age=60, s-maxage=300",
			"X-Content-Type-Options": "nosniff",
		},
	});
}
