import {
	delayToMs,
	findNode,
	getOutgoingTargets,
	parseDelayData,
	type SendEmailNodeData,
} from "@be/workflow/lib/automation/graph";
import { enqueueAutomationStep } from "@be/workflow/queues/automation.queue";
import { sendAutomationEmail } from "@be/workflow/handlers/automation/send-email-step";
import type { AutomationGraph } from "@reloop/db/schema";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { log } from "evlog";

export async function executeAutomationStep(params: {
	enrollmentId: string;
	stepRunId: string;
	organizationId: string;
}): Promise<void> {
	const { enrollmentId, stepRunId, organizationId } = params;

	const stepRun = await db.query.automationStepRun.findFirst({
		where: and(
			eq(schema.automationStepRun.id, stepRunId),
			eq(schema.automationStepRun.enrollmentId, enrollmentId),
		),
	});
	if (!stepRun) {
		log.warn({ message: "Step run not found", stepRunId });
		return;
	}
	if (
		stepRun.status === "completed" ||
		stepRun.status === "skipped" ||
		stepRun.status === "failed"
	) {
		return;
	}

	const enrollment = await db.query.automationEnrollment.findFirst({
		where: eq(schema.automationEnrollment.id, enrollmentId),
	});
	if (!enrollment) {
		log.warn({ message: "Enrollment not found", enrollmentId });
		return;
	}

	if (enrollment.status !== "active") {
		await markStep(stepRunId, {
			status: "skipped",
			error: `Enrollment is ${enrollment.status}`,
		});
		return;
	}

	const automation = await db.query.automation.findFirst({
		where: eq(schema.automation.id, enrollment.automationId),
	});
	if (!automation || automation.status === "paused") {
		// Leave pending until resumed, or skip if deleted
		if (!automation || automation.deletedAt) {
			await markStep(stepRunId, {
				status: "skipped",
				error: "Automation missing or deleted",
			});
			await completeEnrollment(enrollmentId, "cancelled");
		}
		// If paused: leave step pending — will need re-enqueue on resume (v1.1)
		// For v1, mark skipped so we don't loop forever on delayed job
		if (automation?.status === "paused") {
			await markStep(stepRunId, {
				status: "skipped",
				error: "Automation paused",
			});
			await completeEnrollment(enrollmentId, "cancelled");
		}
		return;
	}

	const version = await db.query.automationVersion.findFirst({
		where: eq(schema.automationVersion.id, enrollment.versionId),
	});
	if (!version) {
		await markStep(stepRunId, {
			status: "failed",
			error: "Version not found",
		});
		await completeEnrollment(enrollmentId, "failed");
		return;
	}

	const graph = version.graph as AutomationGraph;
	const node = findNode(graph, stepRun.nodeId);
	if (!node) {
		await markStep(stepRunId, { status: "failed", error: "Node not found" });
		await completeEnrollment(enrollmentId, "failed");
		return;
	}

	const contact = await db.query.contact.findFirst({
		where: eq(schema.contact.id, enrollment.contactId),
	});
	if (
		!contact ||
		contact.deletedAt ||
		contact.status === "unsubscribed" ||
		contact.status === "blocked"
	) {
		await markStep(stepRunId, {
			status: "skipped",
			error: "Contact not sendable",
		});
		await completeEnrollment(enrollmentId, "cancelled");
		return;
	}

	const now = new Date();
	await db
		.update(schema.automationStepRun)
		.set({ status: "running", startedAt: now, updatedAt: now })
		.where(eq(schema.automationStepRun.id, stepRunId));

	try {
		if (node.type === "delay") {
			// Delay already waited via BullMQ delay; just complete and advance
			await markStep(stepRunId, { status: "completed" });
		} else if (node.type === "send_email") {
			const nodeData = node.data as SendEmailNodeData;
			const result = await sendAutomationEmail({
				organizationId,
				userId: automation.userId,
				contact: {
					email: contact.email,
					firstName: contact.firstName,
					lastName: contact.lastName,
				},
				nodeData: {
					to: nodeData.to || "{{contact.email}}",
					subject: nodeData.subject,
					from: nodeData.from,
					templateId: nodeData.templateId,
					html: nodeData.html,
					text: nodeData.text,
				},
				tags: [
					{ name: "automation", value: sanitizeTag(automation.id) },
					{ name: "enrollment", value: sanitizeTag(enrollment.id) },
					{ name: "step", value: sanitizeTag(stepRun.nodeId) },
				],
			});
			await markStep(stepRunId, {
				status: "completed",
				emailLogId: result.emailLogId,
			});
		} else if (node.type === "trigger") {
			await markStep(stepRunId, { status: "completed" });
		} else {
			await markStep(stepRunId, {
				status: "skipped",
				error: `Unknown node type: ${node.type}`,
			});
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		await markStep(stepRunId, { status: "failed", error: message });
		// Throw so BullMQ retries transient failures
		throw error;
	}

	// Advance to next node
	const nextIds = getOutgoingTargets(graph, node.id);
	if (nextIds.length === 0) {
		await completeEnrollment(enrollmentId, "completed");
		return;
	}

	const nextNodeId = nextIds[0]!;
	const nextNode = findNode(graph, nextNodeId);
	if (!nextNode) {
		await completeEnrollment(enrollmentId, "failed");
		return;
	}

	let delayMs = 0;
	let scheduledFor = new Date();
	if (nextNode.type === "delay") {
		const delayData = parseDelayData(nextNode.data ?? {});
		delayMs = delayToMs(delayData);
		scheduledFor = new Date(Date.now() + delayMs);
	}

	await db
		.update(schema.automationEnrollment)
		.set({ currentNodeId: nextNodeId, updatedAt: new Date() })
		.where(eq(schema.automationEnrollment.id, enrollmentId));

	const [nextStep] = await db
		.insert(schema.automationStepRun)
		.values({
			enrollmentId,
			organizationId,
			nodeId: nextNodeId,
			nodeType: nextNode.type,
			status: "pending",
			scheduledFor,
		})
		.returning();

	if (!nextStep) {
		throw new Error("Failed to create next step run");
	}

	await enqueueAutomationStep({
		enrollmentId,
		stepRunId: nextStep.id,
		organizationId,
		delayMs,
	});
}

async function markStep(
	stepRunId: string,
	patch: {
		status: "completed" | "skipped" | "failed";
		error?: string;
		emailLogId?: string;
	},
) {
	await db
		.update(schema.automationStepRun)
		.set({
			status: patch.status,
			error: patch.error,
			emailLogId: patch.emailLogId,
			finishedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(schema.automationStepRun.id, stepRunId));
}

async function completeEnrollment(
	enrollmentId: string,
	status: "completed" | "cancelled" | "failed",
) {
	const now = new Date();
	await db
		.update(schema.automationEnrollment)
		.set({
			status,
			completedAt: status === "completed" ? now : undefined,
			cancelledAt: status === "cancelled" ? now : undefined,
			updatedAt: now,
		})
		.where(eq(schema.automationEnrollment.id, enrollmentId));
}

/** Tag values may only contain [a-zA-Z0-9_-]. Strip other chars. */
function sanitizeTag(value: string): string {
	return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 256);
}
