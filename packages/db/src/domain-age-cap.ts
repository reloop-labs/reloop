import { and, count, eq, gte } from "drizzle-orm";
import { db } from "./client";
import { emailLog } from "./schema/email";
import { utcDayStart } from "./reserve-send-credits";

/**
 * Domain-age based initial daily cap.
 * Applies to all plans (free, pro, growth, enterprise) for newly added domains.
 * Derived from product spec screenshot.
 *
 * Domain age is time since domain was added to Reloop (domain.createdAt), not WHOIS.
 * Cap is per-domain per UTC day, counting email sends (recipientCount).
 */

export type DomainAgeCap = number | null; // null = dynamic (no age cap, defer to plan)

export function getDomainAgeDays(createdAt: Date, now: Date = new Date()): number {
	const ms = now.getTime() - new Date(createdAt).getTime();
	if (ms <= 0) return 0;
	return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Initial daily cap per domain age band (applies to ALL packages).
 * Uses upper bound of the range in the spec for a deterministic cap:
 * 0–1 day: 10–20 -> 20
 * 2–3 days: 25–50 -> 50
 * 4–7 days: 50–100 -> 100
 * 8–14 days: 100–250 -> 250
 * 15–30 days: 250–500 -> 500
 * 30+ days: Dynamic (null) -> defer to plan/reputation
 */
export function getDomainInitialDailyCap(ageDays: number): DomainAgeCap {
	if (ageDays <= 1) return 20;
	if (ageDays <= 3) return 50;
	if (ageDays <= 7) return 100;
	if (ageDays <= 14) return 250;
	if (ageDays <= 30) return 500;
	return null; // 30+ days: dynamic
}

export function getDomainAgeCapForDomain(
	createdAt: Date,
	now: Date = new Date(),
): DomainAgeCap {
	return getDomainInitialDailyCap(getDomainAgeDays(createdAt, now));
}

export async function getDomainDailySentCount(
	domainId: string,
	now: Date = new Date(),
): Promise<number> {
	const dayStart = utcDayStart(now);
	const [row] = await db
		.select({ value: count() })
		.from(emailLog)
		.where(and(eq(emailLog.domainId, domainId), gte(emailLog.createdAt, dayStart)));
	return row?.value ?? 0;
}

export async function checkDomainAgeDailyCap(args: {
	domain: { id: string; createdAt: Date | string };
	recipientCount: number;
	now?: Date;
}): Promise<{
	allowed: boolean;
	cap: DomainAgeCap;
	ageDays: number;
	sentToday: number;
}> {
	const now = args.now ?? new Date();
	const createdAt = new Date(args.domain.createdAt);
	const ageDays = getDomainAgeDays(createdAt, now);
	const cap = getDomainInitialDailyCap(ageDays);
	if (cap === null) return { allowed: true, cap, ageDays, sentToday: 0 };
	const sentToday = await getDomainDailySentCount(args.domain.id, now);
	const allowed = sentToday + args.recipientCount <= cap;
	return { allowed, cap, ageDays, sentToday };
}
