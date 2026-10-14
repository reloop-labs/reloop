import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import type { SendEmailNodeData } from "@be/workflow/lib/automation/graph";
import {
	fromAddressProblem,
	resolveStepEmail,
} from "@be/workflow/lib/automation/resolve-email";
import {
	mapEnrollment,
	mapStepRun,
} from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import type { AutomationGraph } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function getEnrollmentController(params: {
	organizationId: string;
	automationId: string;
	enrollmentId: string;
}) {
	const automation = await db.query.automation.findFirst({
		where: and(
			eq(schema.automation.id, params.automationId),
			eq(schema.automation.organizationId, params.organizationId),
			isNull(schema.automation.deletedAt),
		),
		columns: { id: true },
	});
	if (!automation) throw AutomationErrors.notFound(params.automationId);

	const enrollment = await db.query.automationEnrollment.findFirst({
		where: and(
			eq(schema.automationEnrollment.id, params.enrollmentId),
			eq(schema.automationEnrollment.automationId, params.automationId),
			eq(schema.automationEnrollment.organizationId, params.organizationId),
		),
		with: {
			contact: {
				columns: {
					email: true,
					firstName: true,
					lastName: true,
				},
			},
			stepRuns: true,
			version: { columns: { graph: true } },
		},
	});
	if (!enrollment)
		throw AutomationErrors.enrollmentNotFound(params.enrollmentId);

	const steps = [...enrollment.stepRuns].sort(
		(a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
	);
	const graph = (enrollment.version?.graph ?? {
		nodes: [],
		edges: [],
	}) as AutomationGraph;
	const emails = await stepEmails({
		organizationId: params.organizationId,
		graph,
		steps,
		contact: enrollment.contact,
	});

	return {
		enrollment: mapEnrollment({
			row: enrollment,
			contact: enrollment.contact,
		}),
		trigger: {
			eventKey: enrollment.context.eventKey ?? null,
			properties: enrollment.context.properties ?? {},
		},
		graph,
		emails,
		steps: steps.map(mapStepRun),
	};
}

/**
 * The email each send step sends this contact: what went out once it has,
 * otherwise what it will send as configured (with any problem that stops it).
 */
async function stepEmails(params: {
	organizationId: string;
	graph: AutomationGraph;
	steps: (typeof schema.automationStepRun.$inferSelect)[];
	contact: {
		email: string;
		firstName: string | null;
		lastName: string | null;
	} | null;
}) {
	const latestRun = new Map(params.steps.map((step) => [step.nodeId, step]));
	const emails: Record<string, StepEmail> = {};
	for (const node of params.graph.nodes) {
		if (node.type !== "send_email") continue;
		const nodeData = (node.data ?? {}) as SendEmailNodeData;
		const emailId = latestRun.get(node.id)?.emailLogId ?? null;
		const log = emailId
			? await db.query.emailLog.findFirst({
					where: eq(schema.emailLog.id, emailId),
					columns: {
						fromEmail: true,
						fromName: true,
						toEmails: true,
						subject: true,
						htmlBody: true,
						status: true,
					},
				})
			: undefined;
		const resolved = await resolveStepEmail({
			organizationId: params.organizationId,
			nodeData,
			contact: params.contact ?? { email: "" },
		});
		if (log) {
			emails[node.id] = {
				from: log.fromName
					? `${log.fromName} <${log.fromEmail}>`
					: log.fromEmail,
				to: log.toEmails.join(", "),
				subject: log.subject,
				templateId: resolved.templateId,
				templateName: resolved.templateName,
				// The mail log keeps the request's HTML, not the template it
				// rendered, so a template step shows the template.
				html: resolved.templateId
					? (resolved.html ?? log.htmlBody)
					: log.htmlBody,
				sent: true,
				emailId,
				deliveryStatus: log.status,
				problem: null,
			};
			continue;
		}
		emails[node.id] = {
			...resolved,
			sent: false,
			emailId: null,
			deliveryStatus: null,
			problem: await fromAddressProblem(params.organizationId, resolved.from),
		};
	}
	return emails;
}

type StepEmail = {
	from: string | null;
	to: string;
	subject: string;
	templateId: string | null;
	templateName: string | null;
	html: string | null;
	sent: boolean;
	emailId: string | null;
	deliveryStatus: string | null;
	problem: string | null;
};
