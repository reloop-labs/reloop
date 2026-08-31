import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import {
	mapEnrollment,
	mapStepRun,
} from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
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
		},
	});
	if (!enrollment)
		throw AutomationErrors.enrollmentNotFound(params.enrollmentId);

	const steps = [...enrollment.stepRuns].sort(
		(a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
	);

	return {
		enrollment: mapEnrollment({
			row: enrollment,
			contact: enrollment.contact,
		}),
		steps: steps.map(mapStepRun),
	};
}
