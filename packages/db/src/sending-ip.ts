import { isIP } from "node:net";
import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { type DatabaseInstance, db } from "./client";
import {
	assertCanAssignDedicatedIp,
	DEFAULT_WARMUP_SCHEDULE,
	emptyProviderCounts,
	normalizeProviderCounts,
	resolveEgressDecision,
	type WarmupSnapshot,
	warmupProgressView,
} from "./ip-warmup";
import { organization } from "./schema/auth";
import { organizationPlan } from "./schema/billing";
import {
	type IpWarmupOverflow,
	ipWarmup,
	type MailboxProvider,
	organizationSendingIp,
	type SendingIpKind,
	type SendingIpStatus,
	sendingIp,
	type WarmupPhase,
} from "./schema/sending-ip";

export function parseSendingIpAddress(
	raw: string,
): { address: string; family: 4 | 6 } | null {
	const address = raw.trim();
	const family = isIP(address);
	if (family !== 4 && family !== 6) return null;
	return {
		address: family === 6 ? address.toLowerCase() : address,
		family,
	};
}

export function parseSendingHostname(raw: string): string | null {
	const hostname = raw.trim().toLowerCase();
	if (hostname.length < 1 || hostname.length > 255) return null;
	if (hostname.includes(" ")) return null;
	if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(hostname)) return null;
	return hostname;
}

function snapshotFromRow(row: typeof ipWarmup.$inferSelect): WarmupSnapshot {
	return {
		status: row.status,
		overflow: row.overflow,
		schedule: row.schedule,
		startedAt: row.startedAt,
		completedAt: row.completedAt,
		pausedAt: row.pausedAt,
		sentTodayByProvider: normalizeProviderCounts(row.sentTodayByProvider),
		dailyWindowStart: row.dailyWindowStart,
	};
}

export type SendingIpFilters = {
	limit?: number;
	offset?: number;
	q?: string;
	kind?: SendingIpKind;
	status?: SendingIpStatus;
	assigned?: boolean;
};

export async function listSendingIps(
	filters: SendingIpFilters = {},
	client: DatabaseInstance = db,
) {
	const limit = filters.limit ?? 50;
	const offset = filters.offset ?? 0;
	const conditions = [];
	if (filters.kind) conditions.push(eq(sendingIp.kind, filters.kind));
	if (filters.status) conditions.push(eq(sendingIp.status, filters.status));
	if (filters.q) {
		const search = or(
			ilike(sendingIp.address, `%${filters.q}%`),
			ilike(sendingIp.hostname, `%${filters.q}%`),
		);
		if (search) conditions.push(search);
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const rows = await client
		.select({
			ip: sendingIp,
			assignment: organizationSendingIp,
			organizationName: organization.name,
			warmup: ipWarmup,
		})
		.from(sendingIp)
		.leftJoin(
			organizationSendingIp,
			and(
				eq(organizationSendingIp.sendingIpId, sendingIp.id),
				isNull(organizationSendingIp.unassignedAt),
			),
		)
		.leftJoin(
			organization,
			eq(organization.id, organizationSendingIp.organizationId),
		)
		.leftJoin(
			ipWarmup,
			eq(ipWarmup.organizationSendingIpId, organizationSendingIp.id),
		)
		.where(whereClause)
		.orderBy(desc(sendingIp.createdAt));

	const filtered =
		filters.assigned == null
			? rows
			: rows.filter((row) =>
					filters.assigned ? Boolean(row.assignment?.id) : !row.assignment?.id,
				);

	const total = filtered.length;
	const items = filtered.slice(offset, offset + limit);
	return { items, total };
}

export async function getSendingIp(
	sendingIpId: string,
	client: DatabaseInstance = db,
) {
	const [row] = await client
		.select({
			ip: sendingIp,
			assignment: organizationSendingIp,
			organizationName: organization.name,
			warmup: ipWarmup,
		})
		.from(sendingIp)
		.leftJoin(
			organizationSendingIp,
			and(
				eq(organizationSendingIp.sendingIpId, sendingIp.id),
				isNull(organizationSendingIp.unassignedAt),
			),
		)
		.leftJoin(
			organization,
			eq(organization.id, organizationSendingIp.organizationId),
		)
		.leftJoin(
			ipWarmup,
			eq(ipWarmup.organizationSendingIpId, organizationSendingIp.id),
		)
		.where(eq(sendingIp.id, sendingIpId))
		.limit(1);
	return row ?? null;
}

export type CreateSendingIpInput = {
	address: string;
	hostname: string;
	kind: SendingIpKind;
	notes?: string | null;
};

export type CreateSendingIpResult =
	| { ok: true; ip: typeof sendingIp.$inferSelect }
	| {
			ok: false;
			code: "invalid_address" | "invalid_hostname" | "duplicate_address";
	  };

export async function createSendingIp(
	input: CreateSendingIpInput,
	client: DatabaseInstance = db,
): Promise<CreateSendingIpResult> {
	const parsed = parseSendingIpAddress(input.address);
	if (!parsed) return { ok: false, code: "invalid_address" };
	const hostname = parseSendingHostname(input.hostname);
	if (!hostname) return { ok: false, code: "invalid_hostname" };

	const existing = await client.query.sendingIp.findFirst({
		where: eq(sendingIp.address, parsed.address),
	});
	if (existing) return { ok: false, code: "duplicate_address" };

	const [ip] = await client
		.insert(sendingIp)
		.values({
			address: parsed.address,
			hostname,
			kind: input.kind,
			notes: input.notes ?? null,
		})
		.returning();
	if (!ip) return { ok: false, code: "duplicate_address" };
	return { ok: true, ip };
}

export type UpdateSendingIpInput = {
	hostname?: string;
	status?: SendingIpStatus;
	notes?: string | null;
};

export type UpdateSendingIpResult =
	| { ok: true; ip: typeof sendingIp.$inferSelect }
	| {
			ok: false;
			code: "not_found" | "invalid_hostname" | "assigned" | "invalid_status";
	  };

export async function updateSendingIp(
	sendingIpId: string,
	input: UpdateSendingIpInput,
	client: DatabaseInstance = db,
): Promise<UpdateSendingIpResult> {
	const ip = await client.query.sendingIp.findFirst({
		where: eq(sendingIp.id, sendingIpId),
	});
	if (!ip) return { ok: false, code: "not_found" };

	let hostname = ip.hostname;
	if (input.hostname != null) {
		const parsed = parseSendingHostname(input.hostname);
		if (!parsed) return { ok: false, code: "invalid_hostname" };
		hostname = parsed;
	}

	if (input.status === "retired" || input.status === "disabled") {
		const assigned = await client.query.organizationSendingIp.findFirst({
			where: and(
				eq(organizationSendingIp.sendingIpId, sendingIpId),
				isNull(organizationSendingIp.unassignedAt),
			),
		});
		if (assigned) return { ok: false, code: "assigned" };
	}

	const [updated] = await client
		.update(sendingIp)
		.set({
			hostname,
			status: input.status ?? ip.status,
			notes: input.notes === undefined ? ip.notes : input.notes,
			updatedAt: new Date(),
		})
		.where(eq(sendingIp.id, sendingIpId))
		.returning();
	if (!updated) return { ok: false, code: "not_found" };
	return { ok: true, ip: updated };
}

export type AssignDedicatedIpInput = {
	sendingIpId: string;
	organizationId: string;
	assignedByUserId?: string | null;
	isPrimary?: boolean;
	overflow?: IpWarmupOverflow;
	startWarmup?: boolean;
	now?: Date;
	schedule?: WarmupPhase[];
};

export type AssignDedicatedIpResult =
	| {
			ok: true;
			assignment: typeof organizationSendingIp.$inferSelect;
			warmup: typeof ipWarmup.$inferSelect;
			ip: typeof sendingIp.$inferSelect;
	  }
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

export async function assignDedicatedIp(
	input: AssignDedicatedIpInput,
	outer: DatabaseInstance = db,
): Promise<AssignDedicatedIpResult> {
	const now = input.now ?? new Date();
	return outer.transaction(async (tx) => {
		const [lockedIp] = await tx
			.select()
			.from(sendingIp)
			.where(eq(sendingIp.id, input.sendingIpId))
			.for("update");

		const [activeAssignment] = await tx
			.select()
			.from(organizationSendingIp)
			.where(
				and(
					eq(organizationSendingIp.sendingIpId, input.sendingIpId),
					isNull(organizationSendingIp.unassignedAt),
				),
			)
			.limit(1);

		const org = await tx.query.organization.findFirst({
			where: eq(organization.id, input.organizationId),
		});

		const plan = await tx.query.organizationPlan.findFirst({
			where: eq(organizationPlan.organizationId, input.organizationId),
		});

		const orgAssignments = await tx
			.select({ id: organizationSendingIp.id })
			.from(organizationSendingIp)
			.where(
				and(
					eq(organizationSendingIp.organizationId, input.organizationId),
					isNull(organizationSendingIp.unassignedAt),
				),
			);

		const check = assertCanAssignDedicatedIp({
			ip: lockedIp ? { kind: lockedIp.kind, status: lockedIp.status } : null,
			alreadyAssigned: activeAssignment != null,
			orgExists: org != null,
			dedicatedIpCount: plan?.dedicatedIpCount ?? 0,
			currentOrgIpCount: orgAssignments.length,
		});
		if (!check.ok) return check;
		if (!lockedIp) return { ok: false, code: "ip_not_found" as const };

		const makePrimary = input.isPrimary === true || orgAssignments.length === 0;
		if (makePrimary) {
			await tx
				.update(organizationSendingIp)
				.set({ isPrimary: false, updatedAt: now })
				.where(
					and(
						eq(organizationSendingIp.organizationId, input.organizationId),
						isNull(organizationSendingIp.unassignedAt),
						eq(organizationSendingIp.isPrimary, true),
					),
				);
		}

		const startWarmup = input.startWarmup !== false;
		const [assignment] = await tx
			.insert(organizationSendingIp)
			.values({
				organizationId: input.organizationId,
				sendingIpId: lockedIp.id,
				assignedByUserId: input.assignedByUserId ?? null,
				isPrimary: makePrimary,
				assignedAt: now,
				updatedAt: now,
			})
			.returning();
		if (!assignment) return { ok: false, code: "already_assigned" as const };

		const [warmup] = await tx
			.insert(ipWarmup)
			.values({
				organizationSendingIpId: assignment.id,
				sendingIpId: lockedIp.id,
				organizationId: input.organizationId,
				status: startWarmup ? "active" : "pending",
				overflow: input.overflow ?? "shared",
				schedule: input.schedule ?? DEFAULT_WARMUP_SCHEDULE,
				startedAt: startWarmup ? now : null,
				sentTodayByProvider: emptyProviderCounts(),
				dailyWindowStart: now,
				createdAt: now,
				updatedAt: now,
			})
			.returning();
		if (!warmup) return { ok: false, code: "already_assigned" as const };

		return { ok: true, assignment, warmup, ip: lockedIp };
	});
}

export type UnassignDedicatedIpResult =
	| { ok: true; ip: typeof sendingIp.$inferSelect }
	| { ok: false; code: "ip_not_found" | "not_assigned" };

export async function unassignDedicatedIp(
	sendingIpId: string,
	outer: DatabaseInstance = db,
	now: Date = new Date(),
): Promise<UnassignDedicatedIpResult> {
	return outer.transaction(async (tx) => {
		const ip = await tx.query.sendingIp.findFirst({
			where: eq(sendingIp.id, sendingIpId),
		});
		if (!ip) return { ok: false, code: "ip_not_found" as const };

		const [assignment] = await tx
			.select()
			.from(organizationSendingIp)
			.where(
				and(
					eq(organizationSendingIp.sendingIpId, sendingIpId),
					isNull(organizationSendingIp.unassignedAt),
				),
			)
			.for("update");
		if (!assignment) return { ok: false, code: "not_assigned" as const };

		await tx
			.update(organizationSendingIp)
			.set({
				unassignedAt: now,
				isPrimary: false,
				updatedAt: now,
			})
			.where(eq(organizationSendingIp.id, assignment.id));

		await tx
			.update(ipWarmup)
			.set({
				status: "aborted",
				updatedAt: now,
			})
			.where(
				and(
					eq(ipWarmup.organizationSendingIpId, assignment.id),
					sql`${ipWarmup.status} in ('pending', 'active', 'paused')`,
				),
			);

		if (assignment.isPrimary) {
			const [nextPrimary] = await tx
				.select()
				.from(organizationSendingIp)
				.where(
					and(
						eq(organizationSendingIp.organizationId, assignment.organizationId),
						isNull(organizationSendingIp.unassignedAt),
					),
				)
				.orderBy(organizationSendingIp.assignedAt)
				.limit(1);
			if (nextPrimary) {
				await tx
					.update(organizationSendingIp)
					.set({ isPrimary: true, updatedAt: now })
					.where(eq(organizationSendingIp.id, nextPrimary.id));
			}
		}

		return { ok: true, ip };
	});
}

export type WarmupAction = "pause" | "resume" | "complete" | "restart";

export type SetWarmupActionResult =
	| { ok: true; warmup: typeof ipWarmup.$inferSelect }
	| {
			ok: false;
			code: "ip_not_found" | "not_assigned" | "invalid_action";
	  };

export async function setWarmupAction(
	sendingIpId: string,
	action: WarmupAction,
	outer: DatabaseInstance = db,
	now: Date = new Date(),
): Promise<SetWarmupActionResult> {
	return outer.transaction(async (tx) => {
		const [assignment] = await tx
			.select()
			.from(organizationSendingIp)
			.where(
				and(
					eq(organizationSendingIp.sendingIpId, sendingIpId),
					isNull(organizationSendingIp.unassignedAt),
				),
			)
			.limit(1);
		if (!assignment) {
			const ip = await tx.query.sendingIp.findFirst({
				where: eq(sendingIp.id, sendingIpId),
			});
			return {
				ok: false,
				code: ip ? "not_assigned" : "ip_not_found",
			};
		}

		const [warmup] = await tx
			.select()
			.from(ipWarmup)
			.where(eq(ipWarmup.organizationSendingIpId, assignment.id))
			.for("update");
		if (!warmup) return { ok: false, code: "not_assigned" as const };

		let patch: Partial<typeof ipWarmup.$inferInsert> = { updatedAt: now };
		if (action === "pause") {
			if (warmup.status !== "active" && warmup.status !== "pending") {
				return { ok: false, code: "invalid_action" as const };
			}
			patch = { ...patch, status: "paused", pausedAt: now };
		} else if (action === "resume") {
			if (warmup.status !== "paused" && warmup.status !== "pending") {
				return { ok: false, code: "invalid_action" as const };
			}
			patch = {
				...patch,
				status: "active",
				pausedAt: null,
				startedAt: warmup.startedAt ?? now,
			};
		} else if (action === "complete") {
			if (warmup.status === "aborted") {
				return { ok: false, code: "invalid_action" as const };
			}
			patch = {
				...patch,
				status: "completed",
				completedAt: now,
				startedAt: warmup.startedAt ?? now,
			};
		} else if (action === "restart") {
			patch = {
				...patch,
				status: "active",
				startedAt: now,
				completedAt: null,
				pausedAt: null,
				sentTodayByProvider: emptyProviderCounts(),
				dailyWindowStart: now,
			};
		}

		const [updated] = await tx
			.update(ipWarmup)
			.set(patch)
			.where(eq(ipWarmup.id, warmup.id))
			.returning();
		if (!updated) return { ok: false, code: "not_assigned" as const };
		return { ok: true, warmup: updated };
	});
}

export async function listOrganizationSendingIps(
	organizationId: string,
	client: DatabaseInstance = db,
) {
	const plan = await client.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, organizationId),
	});

	const items = await client
		.select({
			ip: sendingIp,
			assignment: organizationSendingIp,
			organizationName: organization.name,
			warmup: ipWarmup,
		})
		.from(organizationSendingIp)
		.innerJoin(sendingIp, eq(sendingIp.id, organizationSendingIp.sendingIpId))
		.innerJoin(
			organization,
			eq(organization.id, organizationSendingIp.organizationId),
		)
		.leftJoin(
			ipWarmup,
			eq(ipWarmup.organizationSendingIpId, organizationSendingIp.id),
		)
		.where(
			and(
				eq(organizationSendingIp.organizationId, organizationId),
				isNull(organizationSendingIp.unassignedAt),
			),
		)
		.orderBy(
			desc(organizationSendingIp.isPrimary),
			organizationSendingIp.assignedAt,
		);

	return {
		organizationId,
		dedicatedIpCount: plan?.dedicatedIpCount ?? 0,
		assignedCount: items.length,
		items,
	};
}

export function presentOrganizationSendingIps(
	result: Awaited<ReturnType<typeof listOrganizationSendingIps>>,
	now: Date = new Date(),
) {
	return {
		dedicatedIpCount: result.dedicatedIpCount,
		assignedCount: result.assignedCount,
		items: result.items.map((row) => ({
			id: row.ip.id,
			address: row.ip.address,
			hostname: row.ip.hostname,
			isPrimary: row.assignment.isPrimary,
			assignedAt: row.assignment.assignedAt,
			warmup: row.warmup ? warmupProgressView(row.warmup, now) : null,
		})),
	};
}

export type OrgEgress = {
	pool: "dedicated" | "shared" | "defer";
	provider: MailboxProvider;
	reason: ReturnType<typeof resolveEgressDecision>["reason"];
	sendingIpId: string | null;
	address: string | null;
	hostname: string | null;
	day: number;
	dailyCap: number | null;
	sentToday: number;
};

export async function resolveOrgEgress(
	organizationId: string,
	args: {
		provider: MailboxProvider;
		recipientCount?: number;
		now?: Date;
	},
	outer: DatabaseInstance = db,
): Promise<OrgEgress> {
	const recipientCount = args.recipientCount ?? 1;
	const now = args.now ?? new Date();
	const provider = args.provider;
	return outer.transaction(async (tx) => {
		const [assignment] = await tx
			.select()
			.from(organizationSendingIp)
			.where(
				and(
					eq(organizationSendingIp.organizationId, organizationId),
					isNull(organizationSendingIp.unassignedAt),
					eq(organizationSendingIp.isPrimary, true),
				),
			)
			.for("update");

		if (!assignment) {
			const decision = resolveEgressDecision({
				assignment: null,
				provider,
				recipientCount,
				now,
			});
			return {
				pool: decision.pool,
				provider: decision.provider,
				reason: decision.reason,
				sendingIpId: null,
				address: null,
				hostname: null,
				day: decision.day,
				dailyCap: decision.dailyCap,
				sentToday: decision.sentToday,
			};
		}

		const [ip] = await tx
			.select()
			.from(sendingIp)
			.where(eq(sendingIp.id, assignment.sendingIpId))
			.for("update");

		const [lockedWarmup] = await tx
			.select()
			.from(ipWarmup)
			.where(eq(ipWarmup.organizationSendingIpId, assignment.id))
			.for("update");

		const decision = resolveEgressDecision({
			assignment: ip
				? {
						ipStatus: ip.status,
						warmup: lockedWarmup ? snapshotFromRow(lockedWarmup) : null,
					}
				: null,
			provider,
			recipientCount,
			now,
		});

		if (lockedWarmup && decision.warmupNext && decision.pool === "dedicated") {
			await tx
				.update(ipWarmup)
				.set({
					status: decision.warmupNext.status,
					sentTodayByProvider: decision.warmupNext.sentTodayByProvider,
					dailyWindowStart: decision.warmupNext.dailyWindowStart,
					completedAt: decision.warmupNext.completedAt,
					updatedAt: now,
				})
				.where(eq(ipWarmup.id, lockedWarmup.id));
		} else if (
			lockedWarmup &&
			decision.warmupNext &&
			decision.warmupNext.dailyWindowStart.getTime() !==
				lockedWarmup.dailyWindowStart.getTime()
		) {
			await tx
				.update(ipWarmup)
				.set({
					sentTodayByProvider: decision.warmupNext.sentTodayByProvider,
					dailyWindowStart: decision.warmupNext.dailyWindowStart,
					updatedAt: now,
				})
				.where(eq(ipWarmup.id, lockedWarmup.id));
		}

		return {
			pool: decision.pool,
			provider: decision.provider,
			reason: decision.reason,
			sendingIpId: decision.pool === "dedicated" && ip ? ip.id : null,
			address: decision.pool === "dedicated" && ip ? ip.address : null,
			hostname: decision.pool === "dedicated" && ip ? ip.hostname : null,
			day: decision.day,
			dailyCap: decision.dailyCap,
			sentToday: decision.sentToday,
		};
	});
}
