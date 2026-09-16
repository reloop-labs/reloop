import { utcDayStart } from "./reserve-send-credits";
import type {
	IpWarmupOverflow,
	IpWarmupStatus,
	MailboxProvider,
	ProviderSendCounts,
	WarmupPhase,
} from "./schema/sending-ip";
import { MAILBOX_PROVIDERS } from "./schema/sending-ip";

/** Share of each day's dedicated volume, matching mailbox-provider scoring. */
export const MAILBOX_PROVIDER_SHARES: Record<MailboxProvider, number> = {
	gmail: 0.4,
	microsoft: 0.3,
	yahoo: 0.15,
	apple: 0.08,
	other: 0.07,
};

const GLOBAL_PHASES: Array<[number, number, number]> = [
	[1, 7, 200],
	[8, 14, 500],
	[15, 21, 1_000],
	[22, 28, 2_500],
	[29, 35, 5_000],
	[36, 42, 10_000],
];

/** Largest-remainder split so provider caps always sum to the daily total. */
export function splitProviderCaps(total: number): ProviderSendCounts {
	const raw = MAILBOX_PROVIDERS.map((provider) => {
		const exact = total * MAILBOX_PROVIDER_SHARES[provider];
		const floor = Math.floor(exact);
		return { provider, floor, remainder: exact - floor };
	});
	let assigned = raw.reduce((sum, row) => sum + row.floor, 0);
	const caps = {} as ProviderSendCounts;
	for (const row of raw) caps[row.provider] = row.floor;
	const leftover = total - assigned;
	const byRemainder = [...raw].sort((a, b) => b.remainder - a.remainder);
	for (let i = 0; i < leftover; i++) {
		caps[byRemainder[i]!.provider] += 1;
		assigned += 1;
	}
	return caps;
}

function phase(
	startDay: number,
	endDay: number,
	dailyCap: number,
): WarmupPhase {
	return {
		startDay,
		endDay,
		dailyCap,
		providers: splitProviderCaps(dailyCap),
	};
}

/** Conservative 6-week schedule. Caps are per mailbox provider, not global. */
export const DEFAULT_WARMUP_SCHEDULE: WarmupPhase[] = GLOBAL_PHASES.map(
	([startDay, endDay, dailyCap]) => phase(startDay, endDay, dailyCap),
);

const MS_PER_DAY = 86_400_000;

export function emptyProviderCounts(): ProviderSendCounts {
	return {
		gmail: 0,
		microsoft: 0,
		yahoo: 0,
		apple: 0,
		other: 0,
	};
}

export function normalizeProviderCounts(
	raw: Partial<ProviderSendCounts> | null | undefined,
): ProviderSendCounts {
	const next = emptyProviderCounts();
	if (!raw) return next;
	for (const provider of MAILBOX_PROVIDERS) {
		const value = raw[provider];
		next[provider] = typeof value === "number" && value > 0 ? value : 0;
	}
	return next;
}

export function totalSentToday(counts: ProviderSendCounts): number {
	return MAILBOX_PROVIDERS.reduce((sum, provider) => sum + counts[provider], 0);
}

export function warmupDayNumber(startedAt: Date, now: Date): number {
	const start = utcDayStart(startedAt);
	const today = utcDayStart(now);
	const elapsed = today.getTime() - start.getTime();
	if (elapsed < 0) return 1;
	return Math.floor(elapsed / MS_PER_DAY) + 1;
}

export function phaseForDay(
	schedule: WarmupPhase[],
	day: number,
): WarmupPhase | null {
	for (const entry of schedule) {
		if (day >= entry.startDay && day <= entry.endDay) return entry;
	}
	return null;
}

export function dailyCapForDay(
	schedule: WarmupPhase[],
	day: number,
): number | null {
	return phaseForDay(schedule, day)?.dailyCap ?? null;
}

export function providerCapForDay(
	schedule: WarmupPhase[],
	day: number,
	provider: MailboxProvider,
): number | null {
	const entry = phaseForDay(schedule, day);
	if (!entry) return null;
	return entry.providers[provider];
}

export type WarmupSnapshot = {
	status: IpWarmupStatus;
	overflow: IpWarmupOverflow;
	schedule: WarmupPhase[];
	startedAt: Date | null;
	completedAt: Date | null;
	pausedAt: Date | null;
	sentTodayByProvider: ProviderSendCounts;
	dailyWindowStart: Date;
};

export type WarmupReservationAccepted = {
	ok: true;
	pool: "dedicated";
	provider: MailboxProvider;
	day: number;
	dailyCap: number | null;
	sentToday: number;
	sentTodayByProvider: ProviderSendCounts;
	dailyWindowStart: Date;
	status: IpWarmupStatus;
	completed: boolean;
	next: WarmupSnapshot;
};

export type WarmupReservationOverflow = {
	ok: false;
	reason: "overflow";
	pool: "shared" | "defer";
	provider: MailboxProvider;
	day: number;
	dailyCap: number;
	sentToday: number;
	sentTodayByProvider: ProviderSendCounts;
	dailyWindowStart: Date;
	next: WarmupSnapshot;
};

export type WarmupReservationSkipped = {
	ok: false;
	reason: "paused" | "pending" | "aborted" | "no_start";
	pool: "shared";
	provider: MailboxProvider;
	day: number;
	dailyCap: number | null;
	sentToday: number;
	sentTodayByProvider: ProviderSendCounts;
	dailyWindowStart: Date;
	next: WarmupSnapshot;
};

export type WarmupReservation =
	| WarmupReservationAccepted
	| WarmupReservationOverflow
	| WarmupReservationSkipped;

function rolledCounts(
	warmup: WarmupSnapshot,
	now: Date,
): { counts: ProviderSendCounts; dailyWindowStart: Date } {
	const today = utcDayStart(now);
	const rollsDaily = warmup.dailyWindowStart < today;
	return {
		counts: rollsDaily
			? emptyProviderCounts()
			: normalizeProviderCounts(warmup.sentTodayByProvider),
		dailyWindowStart: rollsDaily ? today : warmup.dailyWindowStart,
	};
}

/**
 * Decide whether `recipientCount` sends to one mailbox provider may leave
 * the dedicated IP today. Gmail volume does not consume Microsoft's cap.
 */
export function applyWarmupReservation(args: {
	warmup: WarmupSnapshot;
	provider: MailboxProvider;
	recipientCount: number;
	now: Date;
}): WarmupReservation {
	const n = Math.max(0, args.recipientCount);
	const provider = args.provider;
	const { counts, dailyWindowStart } = rolledCounts(args.warmup, args.now);
	const sentBefore = counts[provider];

	const baseNext: WarmupSnapshot = {
		...args.warmup,
		sentTodayByProvider: counts,
		dailyWindowStart,
	};

	const skipped = (
		reason: WarmupReservationSkipped["reason"],
		day: number,
		dailyCap: number | null,
	): WarmupReservationSkipped => ({
		ok: false,
		reason,
		pool: "shared",
		provider,
		day,
		dailyCap,
		sentToday: sentBefore,
		sentTodayByProvider: counts,
		dailyWindowStart,
		next: baseNext,
	});

	if (args.warmup.status === "completed") {
		const nextCounts = { ...counts, [provider]: sentBefore + n };
		return {
			ok: true,
			pool: "dedicated",
			provider,
			day: args.warmup.startedAt
				? warmupDayNumber(args.warmup.startedAt, args.now)
				: 0,
			dailyCap: null,
			sentToday: sentBefore + n,
			sentTodayByProvider: nextCounts,
			dailyWindowStart,
			status: "completed",
			completed: true,
			next: {
				...baseNext,
				sentTodayByProvider: nextCounts,
				status: "completed",
			},
		};
	}

	if (args.warmup.status === "paused") {
		const day = args.warmup.startedAt
			? warmupDayNumber(args.warmup.startedAt, args.now)
			: 0;
		return skipped(
			"paused",
			day,
			args.warmup.startedAt
				? providerCapForDay(args.warmup.schedule, day, provider)
				: (args.warmup.schedule[0]?.providers[provider] ?? null),
		);
	}

	if (args.warmup.status === "aborted") {
		return skipped("aborted", 0, null);
	}

	if (args.warmup.status === "pending" || !args.warmup.startedAt) {
		return skipped(
			args.warmup.startedAt ? "pending" : "no_start",
			0,
			args.warmup.schedule[0]?.providers[provider] ?? null,
		);
	}

	const day = warmupDayNumber(args.warmup.startedAt, args.now);
	const dailyCap = providerCapForDay(args.warmup.schedule, day, provider);

	if (dailyCap == null) {
		const nextCounts = { ...counts, [provider]: sentBefore + n };
		return {
			ok: true,
			pool: "dedicated",
			provider,
			day,
			dailyCap: null,
			sentToday: sentBefore + n,
			sentTodayByProvider: nextCounts,
			dailyWindowStart,
			status: "completed",
			completed: true,
			next: {
				...baseNext,
				status: "completed",
				completedAt: args.warmup.completedAt ?? args.now,
				sentTodayByProvider: nextCounts,
			},
		};
	}

	if (n === 0) {
		return {
			ok: true,
			pool: "dedicated",
			provider,
			day,
			dailyCap,
			sentToday: sentBefore,
			sentTodayByProvider: counts,
			dailyWindowStart,
			status: "active",
			completed: false,
			next: { ...baseNext, status: "active" },
		};
	}

	if (sentBefore + n > dailyCap) {
		return {
			ok: false,
			reason: "overflow",
			pool: args.warmup.overflow,
			provider,
			day,
			dailyCap,
			sentToday: sentBefore,
			sentTodayByProvider: counts,
			dailyWindowStart,
			next: { ...baseNext, status: "active" },
		};
	}

	const nextCounts = { ...counts, [provider]: sentBefore + n };
	return {
		ok: true,
		pool: "dedicated",
		provider,
		day,
		dailyCap,
		sentToday: sentBefore + n,
		sentTodayByProvider: nextCounts,
		dailyWindowStart,
		status: "active",
		completed: false,
		next: {
			...baseNext,
			status: "active",
			sentTodayByProvider: nextCounts,
		},
	};
}

export type EgressPool = "dedicated" | "shared" | "defer";

export type EgressDecision = {
	pool: EgressPool;
	provider: MailboxProvider;
	reason:
		| "assigned"
		| "warmed"
		| "no_assignment"
		| "ip_disabled"
		| "warmup_overflow"
		| "warmup_paused"
		| "warmup_pending"
		| "warmup_aborted";
	day: number;
	dailyCap: number | null;
	sentToday: number;
	sentTodayByProvider: ProviderSendCounts;
	warmupNext: WarmupSnapshot | null;
};

export function resolveEgressDecision(args: {
	assignment: {
		ipStatus: "active" | "disabled" | "retired";
		warmup: WarmupSnapshot | null;
	} | null;
	provider: MailboxProvider;
	recipientCount: number;
	now: Date;
}): EgressDecision {
	const empty = emptyProviderCounts();
	if (!args.assignment) {
		return {
			pool: "shared",
			provider: args.provider,
			reason: "no_assignment",
			day: 0,
			dailyCap: null,
			sentToday: 0,
			sentTodayByProvider: empty,
			warmupNext: null,
		};
	}

	if (args.assignment.ipStatus !== "active") {
		return {
			pool: "shared",
			provider: args.provider,
			reason: "ip_disabled",
			day: 0,
			dailyCap: null,
			sentToday: 0,
			sentTodayByProvider: empty,
			warmupNext: null,
		};
	}

	if (!args.assignment.warmup) {
		return {
			pool: "dedicated",
			provider: args.provider,
			reason: "assigned",
			day: 0,
			dailyCap: null,
			sentToday: 0,
			sentTodayByProvider: empty,
			warmupNext: null,
		};
	}

	const reservation = applyWarmupReservation({
		warmup: args.assignment.warmup,
		provider: args.provider,
		recipientCount: args.recipientCount,
		now: args.now,
	});

	if (reservation.ok) {
		return {
			pool: "dedicated",
			provider: args.provider,
			reason: reservation.completed ? "warmed" : "assigned",
			day: reservation.day,
			dailyCap: reservation.dailyCap,
			sentToday: reservation.sentToday,
			sentTodayByProvider: reservation.sentTodayByProvider,
			warmupNext: reservation.next,
		};
	}

	const reason =
		reservation.reason === "overflow"
			? "warmup_overflow"
			: reservation.reason === "paused"
				? "warmup_paused"
				: reservation.reason === "aborted"
					? "warmup_aborted"
					: "warmup_pending";

	return {
		pool: reservation.pool,
		provider: args.provider,
		reason,
		day: reservation.day,
		dailyCap: reservation.dailyCap,
		sentToday: reservation.sentToday,
		sentTodayByProvider: reservation.sentTodayByProvider,
		warmupNext: reservation.next,
	};
}

export type AssignCheck =
	| { ok: true }
	| {
			ok: false;
			code:
				| "ip_not_found"
				| "not_dedicated"
				| "not_active"
				| "already_assigned"
				| "org_not_found"
				| "entitlement";
	  };

export function assertCanAssignDedicatedIp(args: {
	ip: {
		kind: "shared" | "dedicated";
		status: "active" | "disabled" | "retired";
	} | null;
	alreadyAssigned: boolean;
	orgExists: boolean;
	dedicatedIpCount: number;
	currentOrgIpCount: number;
}): AssignCheck {
	if (!args.ip) return { ok: false, code: "ip_not_found" };
	if (!args.orgExists) return { ok: false, code: "org_not_found" };
	if (args.ip.kind !== "dedicated") return { ok: false, code: "not_dedicated" };
	if (args.ip.status !== "active") return { ok: false, code: "not_active" };
	if (args.alreadyAssigned) return { ok: false, code: "already_assigned" };
	if (args.currentOrgIpCount >= args.dedicatedIpCount) {
		return { ok: false, code: "entitlement" };
	}
	return { ok: true };
}
