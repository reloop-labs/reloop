import {
	delayToMs,
	findNode,
	getFirstActionNodeIds,
	parseDelayData,
} from "@be/workflow/lib/automation/graph";
import { enqueueAutomationStep } from "@be/workflow/queues/automation.queue";
import type { AutomationGraph } from "@reloop/db/schema";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

export async function enrollContactInMatchingAutomations(params: {
	organizationId: string;
	contactId: string;
	triggerEvent: string;
}): Promise<void> {
	const { organizationId, contactId, triggerEvent } = params;

	const automations = await db.query.automation.findMany({
		where: and(
			eq(schema.automation.organizationId, organizationId),
			eq(schema.automation.status, "active"),
			eq(schema.automation.triggerEvent, triggerEvent),
			isNull(schema.automation.deletedAt),
		),
	});

	if (automations.length === 0) {
		return;
	}

	for (const auto of automations) {
		try {
			await enrollInAutomation({
				automation: auto,
				contactId,
				organizationId,
			});
		} catch (error) {
			log.error({
				message: "Failed to enroll contact in automation",
				automationId: auto.id,
				contactId,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
}

async function enrollInAutomation(params: {
	automation: typeof schema.automation.$inferSelect;
	contactId: string;
	organizationId: string;
}): Promise<void> {
	const { automation: auto, contactId, organizationId } = params;

	if (!auto.activeVersionId) {
		log.warn({
			message: "Active automation missing activeVersionId — skipped",
			automationId: auto.id,
		});
		return;
	}

	const existing = await db.query.automationEnrollment.findFirst({
		where: and(
			eq(schema.automationEnrollment.automationId, auto.id),
			eq(schema.automationEnrollment.contactId, contactId),
		),
		columns: { id: true },
	});
	if (existing) {
		log.info({
			message: "Contact already enrolled — skip",
			automationId: auto.id,
			contactId,
		});
		return;
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
		return;
	}

	const graph = version.graph as AutomationGraph;
	const firstNodeIds = getFirstActionNodeIds(graph);
	if (firstNodeIds.length === 0) {
		log.warn({
			message: "Automation has no steps after trigger — skip",
			automationId: auto.id,
		});
		return;
	}

	// v1 linear: take the first outgoing edge only
	const firstNodeId = firstNodeIds[0]!;
	const firstNode = findNode(graph, firstNodeId);
	if (!firstNode) {
		log.warn({
			message: "First action node missing from graph",
			automationId: auto.id,
			nodeId: firstNodeId,
		});
		return;
	}

	const now = new Date();
	let scheduledFor = now;
	let delayMs = 0;

	if (firstNode.type === "delay") {
		const delayData = parseDelayData(firstNode.data ?? {});
		delayMs = delayToMs(delayData);
		scheduledFor = new Date(now.getTime() + delayMs);
	}

	const [enrollment] = await db
		.insert(schema.automationEnrollment)
		.values({
			organizationId,
			automationId: auto.id,
			versionId: version.id,
			contactId,
			status: "active",
			currentNodeId: firstNodeId,
			enrolledAt: now,
		})
		.returning();

	if (!enrollment) {
		throw new Error("Failed to create enrollment");
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
