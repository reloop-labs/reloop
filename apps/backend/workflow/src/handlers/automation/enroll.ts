import {
	delayToMs,
	findNode,
	getFirstActionNodeIds,
	parseDelayData,
} from "@be/workflow/lib/automation/graph";
import { enqueueAutomationStep } from "@be/workflow/queues/automation.queue";
import { db } from "@reloop/db/client";
import type { AutomationGraph } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { log } from "evlog";

export type EnrollOutcome =
	| {
			status: "enrolled";
			enrollmentId: string;
			stepRunId: string;
			delayMs: number;
	  }
	| {
			status: "skipped";
			reason:
				| "missing_version"
				| "already_enrolled"
				| "no_steps"
				| "missing_node";
			existingEnrollmentId?: string;
	  };

export async function enrollContactInMatchingAutomations(params: {
	organizationId: string;
	contactId: string;
	triggerEvent: string;
	properties?: Record<string, unknown>;
}): Promise<number> {
	const { organizationId, contactId, triggerEvent, properties } = params;

	const automations = await db.query.automation.findMany({
		where: and(
			eq(schema.automation.organizationId, organizationId),
			eq(schema.automation.status, "active"),
			eq(schema.automation.triggerEvent, triggerEvent),
			isNull(schema.automation.deletedAt),
		),
	});

	if (automations.length === 0) {
		return 0;
	}

	let enrolled = 0;
	for (const auto of automations) {
		try {
			const result = await enrollContactInAutomation({
				automation: auto,
				contactId,
				organizationId,
				context: {
					eventKey: triggerEvent,
					properties: properties ?? {},
				},
			});
			if (result.status === "enrolled") enrolled += 1;
		} catch (error) {
			log.error({
				message: "Failed to enroll contact in automation",
				automationId: auto.id,
				contactId,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
	return enrolled;
}

export async function enrollContactInAutomation(params: {
	automation: typeof schema.automation.$inferSelect;
	contactId: string;
	organizationId: string;
	context?: {
		eventKey?: string;
		properties?: Record<string, unknown>;
	};
}): Promise<EnrollOutcome> {
	const { automation: auto, contactId, organizationId, context } = params;

	if (!auto.activeVersionId) {
		log.warn({
			message: "Active automation missing activeVersionId — skipped",
			automationId: auto.id,
		});
		return { status: "skipped", reason: "missing_version" };
	}

	// Fast path; checked again under the lock below.
	if (auto.reentry === "once") {
		const existing = await findEnrollment(auto.id, contactId);
		if (existing) return alreadyEnrolled(auto.id, contactId, existing.id);
	}

	const version = await db.query.automationVersion.findFirst({
		where: eq(schema.automationVersion.id, auto.activeVersionId),
	});
	if (!version) {
		log.warn({
			message: "Automation version not found — skip enroll",
			automationId: auto.id,
			versionId: auto.activeVersionId,
		});
		return { status: "skipped", reason: "missing_version" };
	}

	const graph = version.graph as AutomationGraph;
	const firstNodeIds = getFirstActionNodeIds(graph);
	if (firstNodeIds.length === 0) {
		log.warn({
			message: "Automation has no steps after trigger — skip",
			automationId: auto.id,
		});
		return { status: "skipped", reason: "no_steps" };
	}

	// v1 linear: take the first outgoing edge only
	const firstNodeId = firstNodeIds[0];
	if (!firstNodeId) {
		return { status: "skipped", reason: "no_steps" };
	}
	const firstNode = findNode(graph, firstNodeId);
	if (!firstNode) {
		log.warn({
			message: "First action node missing from graph",
			automationId: auto.id,
			nodeId: firstNodeId,
		});
		return { status: "skipped", reason: "missing_node" };
	}

	const now = new Date();
	let scheduledFor = now;
	let delayMs = 0;

	if (firstNode.type === "delay") {
		const delayData = parseDelayData(firstNode.data ?? {});
		delayMs = delayToMs(delayData);
		scheduledFor = new Date(now.getTime() + delayMs);
	}

	const result = await db.transaction(async (tx) => {
		// One enroll at a time per automation+contact, so two events arriving
		// together can't both pass the checks below. Released on commit.
		await tx.execute(
			sql`select pg_advisory_xact_lock(hashtext(${`${auto.id}:${contactId}`}))`,
		);

		if (auto.reentry === "once") {
			const existing = await tx.query.automationEnrollment.findFirst({
				where: and(
					eq(schema.automationEnrollment.automationId, auto.id),
					eq(schema.automationEnrollment.contactId, contactId),
				),
				columns: { id: true },
			});
			if (existing) return { existingEnrollmentId: existing.id };
		}

		const [row] = await tx
			.insert(schema.automationEnrollment)
			.values({
				organizationId,
				automationId: auto.id,
				versionId: version.id,
				contactId,
				status: "active",
				currentNodeId: firstNodeId,
				context: context ?? {},
				enrolledAt: now,
			})
			.returning();
		if (!row) {
			throw new Error("Failed to create enrollment");
		}

		if (auto.reentry === "restart") {
			// The run in progress ends here; its queued steps skip themselves
			// once they see it is cancelled.
			const replaced = await tx
				.update(schema.automationEnrollment)
				.set({
					status: "cancelled",
					cancelledAt: now,
					replacedByEnrollmentId: row.id,
					updatedAt: now,
				})
				.where(
					and(
						eq(schema.automationEnrollment.automationId, auto.id),
						eq(schema.automationEnrollment.contactId, contactId),
						eq(schema.automationEnrollment.status, "active"),
						ne(schema.automationEnrollment.id, row.id),
					),
				)
				.returning({ id: schema.automationEnrollment.id });
			if (replaced.length > 0) {
				log.info({
					message: "Re-entry cancelled the run in progress",
					automationId: auto.id,
					contactId,
					enrollmentId: row.id,
					replacedEnrollmentIds: replaced.map((r) => r.id),
				});
			}
		}
		return { enrollment: row };
	});

	const { enrollment } = result;
	if (!enrollment) {
		return alreadyEnrolled(auto.id, contactId, result.existingEnrollmentId);
	}

	const [stepRun] = await db
		.insert(schema.automationStepRun)
		.values({
			enrollmentId: enrollment.id,
			organizationId,
			nodeId: firstNodeId,
			nodeType: firstNode.type,
			status: "pending",
			scheduledFor,
		})
		.returning();

	if (!stepRun) {
		throw new Error("Failed to create step run");
	}

	await enqueueAutomationStep({
		enrollmentId: enrollment.id,
		stepRunId: stepRun.id,
		organizationId,
		delayMs,
	});

	log.info({
		message: "Contact enrolled in automation",
		automationId: auto.id,
		enrollmentId: enrollment.id,
		contactId,
		firstNodeId,
		delayMs,
	});

	return {
		status: "enrolled",
		enrollmentId: enrollment.id,
		stepRunId: stepRun.id,
		delayMs,
	};
}

export async function cancelEnrollmentsForContact(params: {
	organizationId: string;
	contactId: string;
	reason: string;
}): Promise<void> {
	const now = new Date();
	const updated = await db
		.update(schema.automationEnrollment)
		.set({
			status: "cancelled",
			cancelledAt: now,
			updatedAt: now,
		})
		.where(
			and(
				eq(schema.automationEnrollment.organizationId, params.organizationId),
				eq(schema.automationEnrollment.contactId, params.contactId),
				eq(schema.automationEnrollment.status, "active"),
			),
		)
		.returning();

	if (updated.length > 0) {
		log.info({
			message: "Cancelled active enrollments for contact",
			contactId: params.contactId,
			count: updated.length,
			reason: params.reason,
		});
	}
}

function findEnrollment(automationId: string, contactId: string) {
	return db.query.automationEnrollment.findFirst({
		where: and(
			eq(schema.automationEnrollment.automationId, automationId),
			eq(schema.automationEnrollment.contactId, contactId),
		),
		columns: { id: true },
	});
}

function alreadyEnrolled(
	automationId: string,
	contactId: string,
	existingEnrollmentId: string,
): EnrollOutcome {
	log.info({
		message: "Contact already enrolled — skip",
		automationId,
		contactId,
	});
	return {
		status: "skipped",
		reason: "already_enrolled",
		existingEnrollmentId,
	};
}
