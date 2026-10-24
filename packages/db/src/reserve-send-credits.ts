import { and, eq, isNull, lte } from "drizzle-orm";
import { addMonthsUtc, advancePeriod, periodOverage } from "./billing-period";
import { type DatabaseInstance, db } from "./client";
import {
	billingPeriod,
	creditLedger,
	organizationCredits,
	organizationPlan,
	organizationSubscription,
} from "./schema/billing";
import { isSelfHosted } from "./self-hosted";

const DEFAULT_MONTHLY_CREDITS = 3000;
const DEFAULT_DAILY_EMAIL_LIMIT = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Days a past_due org may keep sending while Polar retries the payment. */
export function pastDueGraceDays(): number {
	const raw = Number(process.env.PAST_DUE_GRACE_DAYS);
	return Number.isFinite(raw) && raw >= 0 ? raw : 7;
}

/** True once a past_due subscription has used up its grace period. */
export function isPastDueBeyondGrace(args: {
	status: string;
	pastDueSince: Date | null;
	now: Date;
	graceDays?: number;
}): boolean {
	if (args.status !== "past_due") return false;
	const since = args.pastDueSince ?? args.now;
	const graceDays = args.graceDays ?? pastDueGraceDays();
	return args.now.getTime() - since.getTime() > graceDays * DAY_MS;
}

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
	/** Unexpired pay-as-you-go balance, spent once the monthly pool is empty. */
	prepaidRemaining?: number;
};

/** Pay-as-you-go balance that can still be spent at `now` (0 once expired). */
export function usablePrepaidCredits(
	row: { prepaidCredits: number; prepaidExpiresAt: Date | null },
	now: Date,
): number {
	if (row.prepaidCredits <= 0) return 0;
	if (!row.prepaidExpiresAt || row.prepaidExpiresAt <= now) return 0;
	return row.prepaidCredits;
}

export type ReserveDenied = {
	ok: false;
	reason: "monthly" | "daily" | "payment";
	remaining: number;
	monthlyCredits: number;
	dailyUsed: number;
	dailyLimit: number | null;
};

export type ReserveAccepted = {
	ok: true;
	/** Monthly plus prepaid credits left after this send. */
	remaining: number;
	/** Part of this send paid from the prepaid balance. */
	fromPrepaid: number;
	monthlyCredits: number;
	dailyUsed: number;
	dailyLimit: number | null;
	dailyWindowStart: Date;
	next: CreditSnapshot;
};

export type ReserveDecision = ReserveAccepted | ReserveDenied;

/**
 * Decide whether a send of `recipientCount` emails fits monthly remaining
 * (plus any prepaid credits) and the plan daily cap. The monthly pool is
 * spent first, then prepaid. Pure: callers persist `next` under a row lock.
 */
export function applyCreditReservation(args: {
	credits: CreditSnapshot;
	dailyEmailLimit: number | null;
	recipientCount: number;
	now: Date;
	unlimited?: boolean;
}): ReserveDecision {
	const n = args.recipientCount;
	const unlimited = args.unlimited === true;
	const today = utcDayStart(args.now);
	const rollsDaily = args.credits.dailyWindowStart < today;
	const dailyUsedBefore = rollsDaily ? 0 : args.credits.dailyEmailsUsed;
	const dailyUsedAfter = dailyUsedBefore + n;
	const dailyWindowStart = rollsDaily ? today : args.credits.dailyWindowStart;
	const dailyLimit = args.dailyEmailLimit;
	const prepaid = Math.max(0, args.credits.prepaidRemaining ?? 0);
	const available = Math.max(0, args.credits.creditsRemaining) + prepaid;

	if (n <= 0) {
		return {
			ok: true,
			remaining: available,
			fromPrepaid: 0,
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

	if (!unlimited && available < n) {
		return {
			ok: false,
			reason: "monthly",
			remaining: available,
			monthlyCredits: args.credits.monthlyCredits,
			dailyUsed: dailyUsedBefore,
			dailyLimit,
		};
	}

	if (!unlimited && dailyLimit != null && dailyUsedAfter > dailyLimit) {
		return {
			ok: false,
			reason: "daily",
			remaining: available,
			monthlyCredits: args.credits.monthlyCredits,
			dailyUsed: dailyUsedBefore,
			dailyLimit,
		};
	}

	const fromMonthly = unlimited
		? 0
		: Math.min(n, Math.max(0, args.credits.creditsRemaining));
	const fromPrepaid = unlimited ? 0 : n - fromMonthly;
	const monthlyRemaining = args.credits.creditsRemaining - fromMonthly;
	const prepaidRemaining = prepaid - fromPrepaid;
	return {
		ok: true,
		remaining: Math.max(0, monthlyRemaining) + prepaidRemaining,
		fromPrepaid,
		monthlyCredits: args.credits.monthlyCredits,
		dailyUsed: dailyUsedAfter,
		dailyLimit,
		dailyWindowStart,
		next: {
			creditsRemaining: monthlyRemaining,
			creditsUsed: args.credits.creditsUsed + n,
			monthlyCredits: args.credits.monthlyCredits,
			currentPeriodEnd: args.credits.currentPeriodEnd,
			dailyEmailsUsed: dailyUsedAfter,
			dailyWindowStart,
			prepaidRemaining,
		},
	};
}

export type CreditReservation = {
	organizationId: string;
	organizationCreditsId: string;
	recipientCount: number;
	/** Part of the reservation taken from prepaid credits (refunded there). */
	fromPrepaid: number;
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
		const periodEnd = addMonthsUtc(now, 1);

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
		// Advance from the period's own anchor (no drift), in UTC.
		const next = advancePeriod({
			periodStart: activeCredits.currentPeriodStart,
			periodEnd: activeCredits.currentPeriodEnd,
			now,
		});

		const [updatedCredits] = await client
			.update(organizationCredits)
			.set({
				creditsUsed: 0,
				creditsRemaining: activeCredits.monthlyCredits,
				currentPeriodStart: next.periodStart,
				currentPeriodEnd: next.periodEnd,
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

		// Record the closed period before its usage is gone (same as the
		// billing-path reset); unique on (org, period_start) so it's idempotent.
		const plan = await client.query.organizationPlan.findFirst({
			where: eq(organizationPlan.organizationId, organizationId),
			columns: { planId: true },
		});
		await client
			.insert(billingPeriod)
			.values({
				organizationId,
				planId: plan?.planId ?? "free",
				periodStart: activeCredits.currentPeriodStart,
				periodEnd: activeCredits.currentPeriodEnd,
				includedEmails: activeCredits.monthlyCredits,
				emailsUsed: activeCredits.creditsUsed,
				emailsOverage: periodOverage(
					activeCredits.monthlyCredits,
					activeCredits.creditsUsed,
				),
			})
			.onConflictDoNothing();

		// Free (non-Polar) orgs: keep the subscription row's period in step.
		// Polar-backed periods are owned by the subscription webhooks.
		await client
			.update(organizationSubscription)
			.set({
				currentPeriodStart: next.periodStart,
				currentPeriodEnd: next.periodEnd,
				updatedAt: now,
			})
			.where(
				and(
					eq(organizationSubscription.organizationId, organizationId),
					isNull(organizationSubscription.polarSubscriptionId),
				),
			);

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

async function loadPlanDailyEmailLimit(
	organizationId: string,
	client: DatabaseInstance,
): Promise<number | null> {
	const plan = await client.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, organizationId),
		columns: { dailyEmailLimit: true },
	});
	if (!plan) {
		return DEFAULT_DAILY_EMAIL_LIMIT;
	}
	return plan.dailyEmailLimit;
}

/** Deny sends once a past_due subscription is beyond its grace period. */
async function paymentDenial(
	organizationId: string,
	client: DatabaseInstance,
	now: Date,
	credits: typeof organizationCredits.$inferSelect,
	dailyLimit: number | null,
): Promise<ReserveDenied | null> {
	const subscription = await client.query.organizationSubscription.findFirst({
		where: eq(organizationSubscription.organizationId, organizationId),
		columns: { status: true, pastDueSince: true },
	});
	if (
		!subscription ||
		!isPastDueBeyondGrace({
			status: subscription.status,
			pastDueSince: subscription.pastDueSince,
			now,
		})
	) {
		return null;
	}
	return {
		ok: false,
		reason: "payment",
		remaining: credits.creditsRemaining,
		monthlyCredits: credits.monthlyCredits,
		dailyUsed: credits.dailyEmailsUsed,
		dailyLimit,
	};
}

function snapshotFromRow(
	row: typeof organizationCredits.$inferSelect,
	now: Date,
): CreditSnapshot {
	return {
		creditsRemaining: row.creditsRemaining,
		creditsUsed: row.creditsUsed,
		monthlyCredits: row.monthlyCredits,
		currentPeriodEnd: row.currentPeriodEnd,
		dailyEmailsUsed: row.dailyEmailsUsed,
		dailyWindowStart: row.dailyWindowStart,
		prepaidRemaining: usablePrepaidCredits(row, now),
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
}): Promise<ReserveDecision> {
	const client = args.client ?? db;
	const now = args.now ?? new Date();
	const credits = await ensureActiveCredits(args.organizationId, client, now);
	const unlimited = isSelfHosted();
	const dailyEmailLimit = unlimited
		? null
		: await loadPlanDailyEmailLimit(args.organizationId, client);
	if (!unlimited) {
		const denied = await paymentDenial(
			args.organizationId,
			client,
			now,
			credits,
			dailyEmailLimit,
		);
		if (denied) return denied;
	}
	return applyCreditReservation({
		credits: snapshotFromRow(credits, now),
		dailyEmailLimit,
		recipientCount: args.recipientCount,
		now,
		unlimited,
	});
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
			fromPrepaid: 0,
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

		const unlimited = isSelfHosted();
		const dailyEmailLimit = unlimited
			? null
			: await loadPlanDailyEmailLimit(organizationId, tx);
		if (!unlimited) {
			const denied = await paymentDenial(
				organizationId,
				tx,
				now,
				locked,
				dailyEmailLimit,
			);
			if (denied) return denied;
		}
		const decision = applyCreditReservation({
			credits: snapshotFromRow(locked, now),
			dailyEmailLimit,
			recipientCount,
			now,
			unlimited,
		});

		if (!decision.ok) {
			return decision;
		}

		if (recipientCount > 0) {
			await tx
				.update(organizationCredits)
				.set({
					creditsUsed: decision.next.creditsUsed,
					creditsRemaining: decision.next.creditsRemaining,
					...(decision.fromPrepaid > 0
						? { prepaidCredits: locked.prepaidCredits - decision.fromPrepaid }
						: {}),
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
				fromPrepaid: decision.fromPrepaid,
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

		// Compare by UTC day: a provisioned window may start mid-day.
		const sameDay =
			utcDayStart(row.dailyWindowStart).getTime() === today.getTime();
		const toPrepaid = Math.min(n, Math.max(0, reservation.fromPrepaid ?? 0));
		await tx
			.update(organizationCredits)
			.set({
				creditsUsed: Math.max(0, row.creditsUsed - n),
				creditsRemaining: !isSelfHosted()
					? row.creditsRemaining + (n - toPrepaid)
					: row.creditsRemaining,
				prepaidCredits: row.prepaidCredits + toPrepaid,
				dailyEmailsUsed: sameDay
					? Math.max(0, row.dailyEmailsUsed - n)
					: row.dailyEmailsUsed,
				updatedAt: now,
			})
			.where(eq(organizationCredits.id, reservation.organizationCreditsId));
	});
}

/**
 * One received email against the monthly pool. Never refused: the balance
 * floors at zero (later sends are what get blocked) while `creditsUsed` keeps
 * counting so overage covers it. Unlimited (self-hosted) only tracks usage.
 */
export function applyReceiveCharge(args: {
	creditsUsed: number;
	creditsRemaining: number;
	/** Unexpired prepaid balance; used once the monthly pool is empty. */
	prepaidRemaining?: number;
	unlimited?: boolean;
}): {
	creditsUsed: number;
	creditsRemaining: number;
	delta: number;
	fromPrepaid: number;
} {
	const prepaid = Math.max(0, args.prepaidRemaining ?? 0);
	if (args.unlimited !== true && args.creditsRemaining <= 0 && prepaid > 0) {
		return {
			creditsUsed: args.creditsUsed + 1,
			creditsRemaining: args.creditsRemaining,
			delta: -1,
			fromPrepaid: 1,
		};
	}
	const creditsRemaining =
		args.unlimited === true
			? args.creditsRemaining
			: Math.max(0, args.creditsRemaining - 1);
	return {
		creditsUsed: args.creditsUsed + 1,
		creditsRemaining,
		delta: creditsRemaining - args.creditsRemaining,
		fromPrepaid: 0,
	};
}

export type ReceiveChargeResult =
	| {
			charged: true;
			remaining: number;
			creditsUsed: number;
			fromPrepaid: number;
	  }
	| { charged: false; reason: "already_charged" };

/**
 * Count one received (non-spam) email against the org's monthly credits, the
 * same pool sends draw from, so the monthly limit and overage cover both
 * directions. Mail is never refused for lack of credits: the balance floors at
 * zero and later sends are what get blocked. Idempotent per inbound email via
 * the ledger's reference ID. Not counted against the daily *sending* cap.
 */
export async function chargeReceiveCredits(args: {
	organizationId: string;
	inboundEmailId: string;
	now?: Date;
	client?: DatabaseInstance;
}): Promise<ReceiveChargeResult> {
	const outer = args.client ?? db;
	const now = args.now ?? new Date();
	const { organizationId, inboundEmailId } = args;

	if (!organizationId) {
		throw new Error("organizationId is required for credit checks");
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
			throw new Error("Failed to lock organization credits for receive charge");
		}

		const existing = await tx.query.creditLedger.findFirst({
			where: (l, { and: both, eq: equals }) =>
				both(
					equals(l.organizationId, organizationId),
					equals(l.entryType, "email_received"),
					equals(l.referenceId, inboundEmailId),
				),
			columns: { id: true },
		});
		if (existing) {
			return { charged: false, reason: "already_charged" } as const;
		}

		const next = applyReceiveCharge({
			creditsUsed: locked.creditsUsed,
			creditsRemaining: locked.creditsRemaining,
			prepaidRemaining: usablePrepaidCredits(locked, now),
			unlimited: isSelfHosted(),
		});
		const { creditsUsed, creditsRemaining: remaining } = next;

		await tx
			.update(organizationCredits)
			.set({
				creditsUsed,
				creditsRemaining: remaining,
				...(next.fromPrepaid > 0
					? { prepaidCredits: locked.prepaidCredits - next.fromPrepaid }
					: {}),
				updatedAt: now,
			})
			.where(eq(organizationCredits.id, locked.id));

		await tx.insert(creditLedger).values({
			organizationId,
			organizationCreditsId: locked.id,
			entryType: "email_received",
			delta: next.delta,
			balanceAfter: remaining,
			reason: "Inbound email received",
			referenceId: inboundEmailId,
		});

		return {
			charged: true,
			remaining,
			creditsUsed,
			fromPrepaid: next.fromPrepaid,
		} as const;
	});
}
