import {
	createMessageController,
	getMyConversationController,
	getOrCreateMyConversationController,
} from "@reloop/admin/routes/admin/support/support.controllers";
import { broadcastConversationUpdate } from "@reloop/admin/routes/admin/support/support.rooms";
import { writeAdminAudit } from "@reloop/admin/utils/audit";
import { BusEvent, bus } from "@reloop/bus";
import {
	assignDedicatedIp,
	createSendingIp,
	getSendingIp,
	listOrganizationSendingIps,
	listSendingIps,
	setWarmupAction,
	unassignDedicatedIp,
	updateSendingIp,
	type WarmupAction,
	warmupProgressView,
} from "@reloop/db";
import { db } from "@reloop/db/client";
import {
	type ipWarmup,
	member,
	type organizationSendingIp,
	type sendingIp,
	user,
} from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError, log } from "evlog";

type SendingIpRow = {
	ip: typeof sendingIp.$inferSelect;
	assignment: typeof organizationSendingIp.$inferSelect | null;
	organizationName: string | null;
	warmup: typeof ipWarmup.$inferSelect | null;
};

function toWarmupView(warmup: typeof ipWarmup.$inferSelect, now: Date) {
	return { id: warmup.id, ...warmupProgressView(warmup, now) };
}

function toSendingIpItem(row: SendingIpRow, now: Date) {
	return {
		id: row.ip.id,
		address: row.ip.address,
		hostname: row.ip.hostname,
		kind: row.ip.kind,
		status: row.ip.status,
		notes: row.ip.notes,
		createdAt: row.ip.createdAt,
		updatedAt: row.ip.updatedAt,
		assignment: row.assignment?.id
			? {
					id: row.assignment.id,
					organizationId: row.assignment.organizationId,
					organizationName: row.organizationName,
					isPrimary: row.assignment.isPrimary,
					assignedAt: row.assignment.assignedAt,
					warmup: row.warmup ? toWarmupView(row.warmup, now) : null,
				}
			: null,
	};
}

function assignError(
	code: string,
	sendingIpId: string,
	organizationId?: string,
) {
	switch (code) {
		case "ip_not_found":
			return createError({
				status: 404,
				message: "Sending IP not found",
				why: `No sending IP with id ${sendingIpId}`,
				fix: "Register the IP first",
			});
		case "org_not_found":
			return createError({
				status: 404,
				message: "Organization not found",
				why: `No organization with id ${organizationId}`,
				fix: "Check the organization id and try again",
			});
		case "not_dedicated":
			return createError({
				status: 400,
				message: "IP is not dedicated",
				why: "Shared pool IPs cannot be assigned to a single organization",
				fix: "Register a dedicated IP, or leave this address in the shared pool",
			});
		case "not_active":
			return createError({
				status: 409,
				message: "IP is not active",
				why: "Disabled or retired IPs cannot be assigned",
				fix: "Set the IP status to active first",
			});
		case "already_assigned":
			return createError({
				status: 409,
				message: "IP is already assigned",
				why: `Sending IP ${sendingIpId} already has an active organization assignment`,
				fix: "Unassign it before assigning it to another organization",
			});
		case "entitlement":
			return createError({
				status: 403,
				message: "Dedicated IP entitlement exhausted",
				why: "This organization already has as many dedicated IPs as its plan allows",
				fix: "Raise dedicatedIpCount on the organization plan, then assign",
			});
		case "not_assigned":
			return createError({
				status: 409,
				message: "IP is not assigned",
				why: `Sending IP ${sendingIpId} has no active organization assignment`,
				fix: "Assign the IP to an organization first",
			});
		case "invalid_action":
			return createError({
				status: 409,
				message: "Warmup action is not valid in the current state",
				why: "Pause, resume, complete, and restart only apply to an in-progress assignment",
				fix: "Reload the IP and choose an action that matches its warmup status",
			});
		default:
			return createError({
				status: 400,
				message: "Could not update sending IP",
				why: code,
				fix: "Check the request and try again",
			});
	}
}

export async function listSendingIpsController(query: {
	limit?: number;
	offset?: number;
	q?: string;
	kind?: "shared" | "dedicated";
	status?: "active" | "disabled" | "retired";
	assigned?: boolean;
}) {
	const now = new Date();
	const result = await listSendingIps({
		limit: query.limit,
		offset: query.offset,
		q: query.q,
		kind: query.kind,
		status: query.status,
		assigned: query.assigned,
	});
	return {
		items: result.items.map((row) => toSendingIpItem(row, now)),
		total: result.total,
	};
}

export async function getSendingIpController(sendingIpId: string) {
	const row = await getSendingIp(sendingIpId);
	if (!row) {
		throw assignError("ip_not_found", sendingIpId);
	}
	return toSendingIpItem(row, new Date());
}

export async function createSendingIpController(args: {
	address: string;
	hostname: string;
	kind: "shared" | "dedicated";
	notes?: string | null;
	actorUserId: string;
}) {
	const result = await createSendingIp({
		address: args.address,
		hostname: args.hostname,
		kind: args.kind,
		notes: args.notes,
	});
	if (!result.ok) {
		if (result.code === "invalid_address") {
			throw createError({
				status: 400,
				message: "Invalid IP address",
				why: `${args.address} is not a valid IPv4 or IPv6 address`,
				fix: "Provide a public sending IPv4 or IPv6 address",
			});
		}
		if (result.code === "invalid_hostname") {
			throw createError({
				status: 400,
				message: "Invalid hostname",
				why: "Hostname must be a DNS name used for PTR/EHLO",
				fix: "Use a hostname like mta1.reloop.sh",
			});
		}
		throw createError({
			status: 409,
			message: "IP already registered",
			why: `Address ${args.address} is already in the sending IP inventory`,
			fix: "Update the existing IP instead of creating a duplicate",
		});
	}

	await writeAdminAudit({
		actorUserId: args.actorUserId,
		action: "sending_ip.create",
		resourceType: "sending_ip",
		resourceId: result.ip.id,
		metadata: {
			address: result.ip.address,
			hostname: result.ip.hostname,
			kind: result.ip.kind,
		},
	});

	return toSendingIpItem(
		{
			ip: result.ip,
			assignment: null,
			organizationName: null,
			warmup: null,
		},
		new Date(),
	);
}

export async function updateSendingIpController(args: {
	sendingIpId: string;
	hostname?: string;
	status?: "active" | "disabled" | "retired";
	notes?: string | null;
	actorUserId: string;
}) {
	const result = await updateSendingIp(args.sendingIpId, {
		hostname: args.hostname,
		status: args.status,
		notes: args.notes,
	});
	if (!result.ok) {
		if (result.code === "invalid_hostname") {
			throw createError({
				status: 400,
				message: "Invalid hostname",
				why: "Hostname must be a DNS name used for PTR/EHLO",
				fix: "Use a hostname like mta1.reloop.sh",
			});
		}
		if (result.code === "assigned") {
			throw createError({
				status: 409,
				message: "IP is assigned",
				why: "An assigned dedicated IP cannot be disabled or retired",
				fix: "Unassign the IP from its organization first",
			});
		}
		throw assignError(result.code, args.sendingIpId);
	}

	await writeAdminAudit({
		actorUserId: args.actorUserId,
		action: "sending_ip.update",
		resourceType: "sending_ip",
		resourceId: result.ip.id,
		metadata: {
			hostname: args.hostname,
			status: args.status,
		},
	});

	const row = await getSendingIp(result.ip.id);
	if (!row) throw assignError("ip_not_found", args.sendingIpId);
	return toSendingIpItem(row, new Date());
}

export async function assignSendingIpController(args: {
	sendingIpId: string;
	organizationId: string;
	isPrimary?: boolean;
	overflow?: "shared" | "defer";
	startWarmup?: boolean;
	actorUserId: string;
}) {
	const result = await assignDedicatedIp({
		sendingIpId: args.sendingIpId,
		organizationId: args.organizationId,
		assignedByUserId: args.actorUserId,
		isPrimary: args.isPrimary,
		overflow: args.overflow,
		startWarmup: args.startWarmup,
	});
	if (!result.ok) {
		throw assignError(result.code, args.sendingIpId, args.organizationId);
	}

	await writeAdminAudit({
		actorUserId: args.actorUserId,
		action: "sending_ip.assign",
		resourceType: "sending_ip",
		resourceId: result.ip.id,
		organizationId: args.organizationId,
		metadata: {
			assignmentId: result.assignment.id,
			warmupId: result.warmup.id,
			isPrimary: result.assignment.isPrimary,
			overflow: result.warmup.overflow,
		},
	});

	const row = await getSendingIp(result.ip.id);
	if (!row) throw assignError("ip_not_found", args.sendingIpId);
	return toSendingIpItem(row, new Date());
}

export async function unassignSendingIpController(args: {
	sendingIpId: string;
	actorUserId: string;
}) {
	const current = await getSendingIp(args.sendingIpId);
	const result = await unassignDedicatedIp(args.sendingIpId);
	if (!result.ok) {
		throw assignError(result.code, args.sendingIpId);
	}

	await writeAdminAudit({
		actorUserId: args.actorUserId,
		action: "sending_ip.unassign",
		resourceType: "sending_ip",
		resourceId: result.ip.id,
		organizationId: current?.assignment?.organizationId ?? null,
		metadata: {
			previousOrganizationId: current?.assignment?.organizationId ?? null,
		},
	});

	const row = await getSendingIp(result.ip.id);
	if (!row) throw assignError("ip_not_found", args.sendingIpId);
	return toSendingIpItem(row, new Date());
}

export async function warmupSendingIpController(args: {
	sendingIpId: string;
	action: WarmupAction;
	actorUserId: string;
}) {
	const result = await setWarmupAction(args.sendingIpId, args.action);
	if (!result.ok) {
		throw assignError(result.code, args.sendingIpId);
	}

	const row = await getSendingIp(args.sendingIpId);
	await writeAdminAudit({
		actorUserId: args.actorUserId,
		action: `sending_ip.warmup.${args.action}`,
		resourceType: "sending_ip",
		resourceId: args.sendingIpId,
		organizationId: row?.assignment?.organizationId ?? null,
		metadata: { warmupId: result.warmup.id, status: result.warmup.status },
	});

	if (!row) throw assignError("ip_not_found", args.sendingIpId);
	return toSendingIpItem(row, new Date());
}

export async function listOrganizationSendingIpsController(
	organizationId: string,
) {
	const now = new Date();
	const result = await listOrganizationSendingIps(organizationId);
	return {
		organizationId: result.organizationId,
		dedicatedIpCount: result.dedicatedIpCount,
		assignedCount: result.assignedCount,
		items: result.items.map((row) => toSendingIpItem(row, now)),
	};
}

type DedicatedIpNotice = {
	ownerName: string | null;
	organizationName: string;
	address: string;
	hostname: string;
	warmup: {
		day: number;
		totalDays: number;
		overflow: "shared" | "defer";
	} | null;
};

function dedicatedIpSupportMessage(notice: DedicatedIpNotice) {
	const firstName = notice.ownerName?.split(" ").at(0) || "there";
	const lines = [
		`Hi ${firstName}, ${notice.organizationName} now has its own dedicated sending IP: ${notice.address} (${notice.hostname}).`,
		`From now on, all email from ${notice.organizationName} is sent through this IP, so your sender reputation is yours alone.`,
	];
	if (notice.warmup) {
		lines.push(
			`We're warming it up over ${notice.warmup.totalDays} days (today is day ${Math.max(notice.warmup.day, 1)}) so inbox providers learn to trust it. ${
				notice.warmup.overflow === "shared"
					? "Anything above the day's limit goes through our shared pool, so nothing is delayed."
					: "Anything above the day's limit is queued and sent as capacity frees up."
			}`,
		);
	}
	lines.push(
		"There's nothing you need to do. Reply here if you have any questions.",
	);
	return lines.join("\n\n");
}

/**
 * One click from the console: tells the org owner about their dedicated IP
 * by email (via the email service) and with a message in their support chat.
 */
export async function notifyDedicatedIpOwnerController(args: {
	sendingIpId: string;
	actorUserId: string;
}) {
	const row = await getSendingIp(args.sendingIpId);
	if (!row) throw assignError("ip_not_found", args.sendingIpId);
	const assignment = row.assignment;
	if (!assignment?.id) {
		throw assignError("not_assigned", args.sendingIpId);
	}

	const [owner] = await db
		.select({ id: user.id, name: user.name, email: user.email })
		.from(member)
		.innerJoin(user, eq(member.userId, user.id))
		.where(
			and(
				eq(member.organizationId, assignment.organizationId),
				eq(member.role, "owner"),
			),
		)
		.limit(1);
	if (!owner) {
		throw createError({
			status: 404,
			message: "Organization has no owner",
			why: `No member with role owner in ${assignment.organizationId}`,
			fix: "Assign an owner to the organization first",
		});
	}

	const warmupView = row.warmup
		? warmupProgressView(row.warmup, new Date())
		: null;
	const notice: DedicatedIpNotice = {
		ownerName: owner.name,
		organizationName: row.organizationName ?? "Your organization",
		address: row.ip.address,
		hostname: row.ip.hostname,
		warmup:
			row.warmup && warmupView && row.warmup.status !== "completed"
				? {
						day: warmupView.day,
						totalDays: Math.max(
							...row.warmup.schedule.map((phase) => phase.endDay),
						),
						overflow: row.warmup.overflow,
					}
				: null,
	};

	// Support message first: it's synchronous, so a failure here aborts
	// before any email is queued.
	let conversationId: string;
	try {
		const created = await getOrCreateMyConversationController({
			userId: owner.id,
			organizationId: assignment.organizationId,
		});
		conversationId = created.conversation.id;
	} catch (error) {
		// Lost a race creating the thread; use the one that won.
		const fallback = await getMyConversationController({ userId: owner.id });
		if (!fallback.conversation) throw error;
		conversationId = fallback.conversation.id;
	}

	const result = await createMessageController({
		conversationId,
		senderUserId: args.actorUserId,
		senderRole: "admin",
		body: dedicatedIpSupportMessage(notice),
		isPlatformAdmin: true,
	});
	broadcastConversationUpdate({
		conversationId,
		conversationForAdmin: result.conversationForAdmin,
		conversationForUser: result.conversationForUser,
		message: result.message,
	});

	let emailQueued = true;
	try {
		await bus.publish(BusEvent.DEDICATED_IP_OWNER_NOTIFIED, {
			assignmentId: assignment.id,
			organizationId: assignment.organizationId,
			organizationName: notice.organizationName,
			ownerEmail: owner.email,
			ownerName: owner.name,
			address: notice.address,
			hostname: notice.hostname,
			warmup: notice.warmup,
		});
	} catch (error) {
		emailQueued = false;
		log.error({
			error: error instanceof Error ? error.message : String(error),
			sendingIpId: args.sendingIpId,
			message:
				"Failed to publish DEDICATED_IP_OWNER_NOTIFIED; support message sent but email not queued",
		});
	}

	await writeAdminAudit({
		actorUserId: args.actorUserId,
		action: "sending_ip.notify_owner",
		resourceType: "sending_ip",
		resourceId: row.ip.id,
		organizationId: assignment.organizationId,
		metadata: {
			ownerUserId: owner.id,
			conversationId,
			emailQueued,
		},
	});

	return {
		ownerEmail: owner.email,
		conversationId,
		supportMessageSent: true,
		emailQueued,
	};
}
