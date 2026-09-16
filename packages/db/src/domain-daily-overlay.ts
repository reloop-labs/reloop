import { eq } from "drizzle-orm";
import { type DatabaseInstance, db } from "./client";
import { domain } from "./schema/domain";

export const NEW_DOMAIN_TOO_NEW_DAILY_CAP = 10;
export const NEW_DOMAIN_COLD_DAILY_CAP = 25;
export const REGISTRATION_AGE_STALE_MS = 7 * 24 * 60 * 60 * 1000;

export type DomainDailyOverlayArgs = {
	registeredAt: Date | null | undefined;
	planId: string | null | undefined;
	now?: Date;
};

/**
 * Extra daily ceiling for young sending domains on shared Reloop IPs.
 * Unknown age fails closed on free (treat as new) and open on paid.
 */
export function domainDailyOverlay(
	args: DomainDailyOverlayArgs,
): number | null {
	const now = args.now ?? new Date();
	const planId = args.planId ?? "free";
	const isFree = planId === "free";

	if (!args.registeredAt) {
		return isFree ? NEW_DOMAIN_TOO_NEW_DAILY_CAP : null;
	}

	const ageMs = now.getTime() - args.registeredAt.getTime();
	const ageDays = Math.floor(ageMs / 86_400_000);

	if (ageDays <= 7) return NEW_DOMAIN_TOO_NEW_DAILY_CAP;
	if (ageDays <= 30) return NEW_DOMAIN_COLD_DAILY_CAP;
	return null;
}

export function mergeDailyLimits(
	planDaily: number | null,
	overlay: number | null,
): number | null {
	if (overlay == null) return planDaily;
	if (planDaily == null) return overlay;
	return Math.min(planDaily, overlay);
}

export function isRegistrationAgeStale(
	checkedAt: Date | null | undefined,
	now: Date = new Date(),
): boolean {
	if (!checkedAt) return true;
	return now.getTime() - checkedAt.getTime() >= REGISTRATION_AGE_STALE_MS;
}

export async function refreshDomainRegistrationAge(args: {
	domainId: string;
	domainName: string;
	registeredAt: Date | null;
	registrationAgeCheckedAt: Date | null;
	lookup: (domainName: string) => Promise<Date | null>;
	now?: Date;
	client?: DatabaseInstance;
}): Promise<Date | null> {
	const now = args.now ?? new Date();
	if (!isRegistrationAgeStale(args.registrationAgeCheckedAt, now)) {
		return args.registeredAt;
	}

	let createdAt: Date | null = args.registeredAt;
	try {
		const lookedUp = await args.lookup(args.domainName);
		if (lookedUp) createdAt = lookedUp;
	} catch {
		return args.registeredAt;
	}

	const client = args.client ?? db;
	await client
		.update(domain)
		.set({
			registeredAt: createdAt,
			registrationAgeCheckedAt: now,
			updatedAt: now,
		})
		.where(eq(domain.id, args.domainId));

	return createdAt;
}
