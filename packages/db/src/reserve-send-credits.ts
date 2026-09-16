import { and, eq, lte } from "drizzle-orm";
import { type DatabaseInstance, db } from "./client";
import { domainDailyOverlay, mergeDailyLimits } from "./domain-daily-overlay";
import {
	creditLedger,
	organizationCredits,
	organizationPlan,
} from "./schema/billing";

const DEFAULT_MONTHLY_CREDITS = 3000;
const DEFAULT_DAILY_EMAIL_LIMIT = 100;

export function utcDayStart(now: Date): Date {
	return new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);
}

export type CreditSnapshot = {
	creditsRemaining: number;
	creditsUsed: number;
	monthlyCredits: number;
	currentPeriodEnd: Date;
	dailyEmailsUsed: number;
	dailyWindowStart: Date;
};

export type ReserveDenied = {
	ok: false;
	reason: "monthly" | "daily";
	cause?: "domain_age";
	remaining: number;
	monthlyCredits: number;
	dailyUsed: number;
	dailyLimit: number | null;
};

export type ReserveAccepted = {
	ok: true;
	remaining: number;
	monthlyCredits: number;
	dailyUsed: number;
	dailyLimit: number | null;
	dailyWindowStart: Date;
	next: CreditSnapshot;
};

export type ReserveDecision = ReserveAccepted | ReserveDenied;

/**
 * Decide whether a send of `recipientCount` emails fits monthly remaining
 * and the plan daily cap. Pure: callers persist `next` under a row lock.
 */
export function applyCreditReservation(args: {
	credits: CreditSnapshot;
	dailyEmailLimit: number | null;
	recipientCount: number;
	now: Date;
}): ReserveDecision {
	const n = args.recipientCount;
	const today = utcDayStart(args.now);
	const rollsDaily = args.credits.dailyWindowStart < today;
	const dailyUsedBefore = rollsDaily ? 0 : args.credits.dailyEmailsUsed;
	const dailyUsedAfter = dailyUsedBefore + n;
	const dailyWindowStart = rollsDaily ? today : args.credits.dailyWindowStart;
	const dailyLimit = args.dailyEmailLimit;

	if (n <= 0) {
		return {
			ok: true,
			remaining: args.credits.creditsRemaining,
			monthlyCredits: args.credits.monthlyCredits,
			dailyUsed: dailyUsedBefore,
			dailyLimit,
			dailyWindowStart,
			next: {
				...args.credits,
				dailyEmailsUsed: dailyUsedBefore,
				dailyWindowStart,
			},
		};
	}

	if (args.credits.creditsRemaining < n) {
		return {
			ok: false,
			reason: "monthly",
			remaining: args.credits.creditsRemaining,
			monthlyCredits: args.credits.monthlyCredits,
			dailyUsed: dailyUsedBefore,
			dailyLimit,
		};
	}

	if (dailyLimit != null && dailyUsedAfter > dailyLimit) {
		return {
			ok: false,
			reason: "daily",
			remaining: args.credits.creditsRemaining,
			monthlyCredits: args.credits.monthlyCredits,
			dailyUsed: dailyUsedBefore,
			dailyLimit,
		};
	}

	return {
		ok: true,
		remaining: args.credits.creditsRemaining - n,
		monthlyCredits: args.credits.monthlyCredits,
		dailyUsed: dailyUsedAfter,
		dailyLimit,
		dailyWindowStart,
		next: {
			creditsRemaining: args.credits.creditsRemaining - n,
			creditsUsed: args.credits.creditsUsed + n,
			monthlyCredits: args.credits.monthlyCredits,
			currentPeriodEnd: args.credits.currentPeriodEnd,
			dailyEmailsUsed: dailyUsedAfter,
			dailyWindowStart,
		},
	};
}

export type CreditReservation = {
	organizationId: string;
	organizationCreditsId: string;
	recipientCount: number;
	dailyWindowStart: Date;
	remaining: number;
	monthlyCredits: number;
	dailyUsed: number;
	dailyLimit: number | null;
};

async function ensureActiveCredits(
	organizationId: string,
	client: DatabaseInstance,
	now: Date,
) {
	let activeCredits = await client.query.organizationCredits.findFirst({
		where: (c, { and: both, eq: equals }) =>
			both(
				equals(c.organizationId, organizationId),
				equals(c.status, "active"),
			),
	});

	if (!activeCredits) {
		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [newCredits] = await client
			.insert(organizationCredits)
			.values({
				organizationId,
				creditsUsed: 0,
				creditsRemaining: DEFAULT_MONTHLY_CREDITS,
				monthlyCredits: DEFAULT_MONTHLY_CREDITS,
				dailyEmailsUsed: 0,
				dailyWindowStart: utcDayStart(now),
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd,
				status: "active",
			})
			.onConflictDoNothing()
			.returning();

		if (!newCredits) {
			activeCredits = await client.query.organizationCredits.findFirst({
				where: (c, { and: both, eq: equals }) =>
					both(
						equals(c.organizationId, organizationId),
						equals(c.status, "active"),
					),
			});
			if (!activeCredits) {
				throw new Error(
					"Failed to retrieve organization credits after provision",
				);
			}
			return activeCredits;
		}

		await client.insert(creditLedger).values({
			organizationId,
			organizationCreditsId: newCredits.id,
			entryType: "credit_purchased",
			delta: DEFAULT_MONTHLY_CREDITS,
			balanceAfter: DEFAULT_MONTHLY_CREDITS,
			reason: "Initial monthly credit quota",
		});

		return newCredits;
	}

	if (now >= activeCredits.currentPeriodEnd) {
		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [updatedCredits] = await client
			.update(organizationCredits)
			.set({
				creditsUsed: 0,
				creditsRemaining: activeCredits.monthlyCredits,
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd,
				updatedAt: now,
			})
			.where(
				and(
					eq(organizationCredits.id, activeCredits.id),
					lte(organizationCredits.currentPeriodEnd, now),
				),
			)
			.returning();

		if (!updatedCredits) {
			const refreshed = await client.query.organizationCredits.findFirst({
				where: (c, { and: both, eq: equals }) =>
					both(
						equals(c.organizationId, organizationId),
						equals(c.status, "active"),
					),
			});
			if (!refreshed) {
				throw new Error("Failed to reset credits for expired period");
			}
			return refreshed;
		}

		await client.insert(creditLedger).values({
			organizationId,
			organizationCreditsId: activeCredits.id,
			entryType: "period_reset",
			delta: activeCredits.monthlyCredits,
			balanceAfter: activeCredits.monthlyCredits,
			reason: "Monthly credit reset (non-rollable)",
		});

		return updatedCredits;
	}

	return activeCredits;
}

async function loadPlanCaps(
	organizationId: string,
	client: DatabaseInstance,
): Promise<{ planId: string; dailyEmailLimit: number | null }> {
	const plan = await client.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, organizationId),
		columns: { planId: true, dailyEmailLimit: true },
	});
	if (!plan) {
		return { planId: "free", dailyEmailLimit: DEFAULT_DAILY_EMAIL_LIMIT };
	}
	return { planId: plan.planId, dailyEmailLimit: plan.dailyEmailLimit };
}

function resolveDailyLimit(args: {
	planId: string;
	planDailyEmailLimit: number | null;
	domainRegisteredAt?: Date | null;
	now: Date;
	applyDomainAgeOverlay?: boolean;
}): { dailyEmailLimit: number | null; domainAgeLimited: boolean } {
	const overlay =
		args.applyDomainAgeOverlay === false
			? null
			: domainDailyOverlay({
					registeredAt: args.domainRegisteredAt,
					planId: args.planId,
					now: args.now,
				});
	const dailyEmailLimit = mergeDailyLimits(args.planDailyEmailLimit, overlay);
	const domainAgeLimited =
		overlay != null &&
		(args.planDailyEmailLimit == null || overlay < args.planDailyEmailLimit);
	return { dailyEmailLimit, domainAgeLimited };
}

function snapshotFromRow(
	row: typeof organizationCredits.$inferSelect,
): CreditSnapshot {
	return {
		creditsRemaining: row.creditsRemaining,
		creditsUsed: row.creditsUsed,
		monthlyCredits: row.monthlyCredits,
		currentPeriodEnd: row.currentPeriodEnd,
		dailyEmailsUsed: row.dailyEmailsUsed,
		dailyWindowStart: row.dailyWindowStart,
	};
}

/**
 * Read-only quota peek. Concurrent senders can still all pass this; callers
 * must `reserveSendCredits` before inject.
 */
export async function peekSendCredits(args: {
	organizationId: string;
	recipientCount: number;
	now?: Date;
	client?: DatabaseInstance;
	domainRegisteredAt?: Date | null;
	applyDomainAgeOverlay?: boolean;
}): Promise<ReserveDecision> {
	const client = args.client ?? db;
	const now = args.now ?? new Date();
	const credits = await ensureActiveCredits(args.organizationId, client, now);
	const plan = await loadPlanCaps(args.organizationId, client);
	const { dailyEmailLimit, domainAgeLimited } = resolveDailyLimit({
		planId: plan.planId,
		planDailyEmailLimit: plan.dailyEmailLimit,
		domainRegisteredAt: args.domainRegisteredAt,
		now,
		applyDomainAgeOverlay: args.applyDomainAgeOverlay,
	});
	const decision = applyCreditReservation({
		credits: snapshotFromRow(credits),
		dailyEmailLimit,
		recipientCount: args.recipientCount,
		now,
	});
	if (!decision.ok && decision.reason === "daily" && domainAgeLimited) {
		return { ...decision, cause: "domain_age" };
	}
	return decision;
}

/**
 * Atomically reserve `recipientCount` against monthly remaining and the plan
 * daily cap. Serializes per org via SELECT … FOR UPDATE.
 */
export async function reserveSendCredits(args: {
	organizationId: string;
	recipientCount: number;
	now?: Date;
	client?: DatabaseInstance;
	domainRegisteredAt?: Date | null;
	applyDomainAgeOverlay?: boolean;
}): Promise<ReserveDecision & { reservation?: CreditReservation }> {
	const outer = args.client ?? db;
	const now = args.now ?? new Date();
	const organizationId = args.organizationId;
	const recipientCount = args.recipientCount;

	if (!organizationId) {
		throw new Error("organizationId is required for credit checks");
	}

	if (recipientCount <= 0) {
		return {
			ok: true,
			remaining: 0,
			monthlyCredits: DEFAULT_MONTHLY_CREDITS,
			dailyUsed: 0,
			dailyLimit: null,
			dailyWindowStart: utcDayStart(now),
			next: {
				creditsRemaining: 0,
				creditsUsed: 0,
				monthlyCredits: DEFAULT_MONTHLY_CREDITS,
				currentPeriodEnd: now,
				dailyEmailsUsed: 0,
				dailyWindowStart: utcDayStart(now),
			},
		};
	}

	return outer.transaction(async (tx) => {
		await ensureActiveCredits(organizationId, tx, now);

		const [locked] = await tx
			.select()
			.from(organizationCredits)
			.where(
				and(
					eq(organizationCredits.organizationId, organizationId),
					eq(organizationCredits.status, "active"),
				),
			)
			.for("update");

		if (!locked) {
			throw new Error("Failed to lock organization credits for reservation");
		}

		const plan = await loadPlanCaps(organizationId, tx);
		const { dailyEmailLimit, domainAgeLimited } = resolveDailyLimit({
			planId: plan.planId,
			planDailyEmailLimit: plan.dailyEmailLimit,
			domainRegisteredAt: args.domainRegisteredAt,
			now,
			applyDomainAgeOverlay: args.applyDomainAgeOverlay,
		});
		const decision = applyCreditReservation({
			credits: snapshotFromRow(locked),
			dailyEmailLimit,
			recipientCount,
			now,
		});

		if (!decision.ok) {
			if (decision.reason === "daily" && domainAgeLimited) {
				return { ...decision, cause: "domain_age" };
			}
			return decision;
		}

		if (recipientCount > 0) {
			await tx
				.update(organizationCredits)
				.set({
					creditsUsed: decision.next.creditsUsed,
					creditsRemaining: decision.next.creditsRemaining,
					dailyEmailsUsed: decision.next.dailyEmailsUsed,
					dailyWindowStart: decision.next.dailyWindowStart,
					updatedAt: now,
				})
				.where(eq(organizationCredits.id, locked.id));
		}

		return {
			...decision,
			reservation: {
				organizationId,
				organizationCreditsId: locked.id,
				recipientCount,
				dailyWindowStart: decision.dailyWindowStart,
				remaining: decision.remaining,
				monthlyCredits: decision.monthlyCredits,
				dailyUsed: decision.dailyUsed,
				dailyLimit: decision.dailyLimit,
			},
		};
	});
}

/** Undo a reservation when inject/log creation fails after reserve. */
export async function refundSendCredits(args: {
	reservation: CreditReservation;
	now?: Date;
	client?: DatabaseInstance;
}): Promise<void> {
	const { reservation } = args;
	if (reservation.recipientCount <= 0) return;

	const outer = args.client ?? db;
	const now = args.now ?? new Date();
	const today = utcDayStart(now);
	const n = reservation.recipientCount;

	await outer.transaction(async (tx) => {
		const [row] = await tx
			.select()
			.from(organizationCredits)
			.where(eq(organizationCredits.id, reservation.organizationCreditsId))
			.for("update");

		if (!row) return;

		const sameDay = row.dailyWindowStart.getTime() === today.getTime();
		await tx
			.update(organizationCredits)
			.set({
				creditsUsed: Math.max(0, row.creditsUsed - n),
				creditsRemaining: row.creditsRemaining + n,
				dailyEmailsUsed: sameDay
					? Math.max(0, row.dailyEmailsUsed - n)
					: row.dailyEmailsUsed,
				updatedAt: now,
			})
			.where(eq(organizationCredits.id, reservation.organizationCreditsId));
	});
}
