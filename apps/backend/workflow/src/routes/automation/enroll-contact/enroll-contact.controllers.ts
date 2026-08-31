import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import { enrollContactInAutomation } from "@be/workflow/handlers/automation/enroll";
import { resolveOrCreateContact } from "@be/workflow/lib/automation/resolve-contact";
import { mapEnrollment } from "@be/workflow/routes/automation/automation.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function enrollContactController(params: {
	organizationId: string;
	userId: string;
	automationId: string;
	contactId?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
}) {
	const automation = await db.query.automation.findFirst({
		where: and(
			eq(schema.automation.id, params.automationId),
			eq(schema.automation.organizationId, params.organizationId),
			isNull(schema.automation.deletedAt),
		),
	});
	if (!automation) throw AutomationErrors.notFound(params.automationId);
	if (automation.status !== "active") throw AutomationErrors.notActive();

	const resolved = await resolveOrCreateContact({
		organizationId: params.organizationId,
		userId: params.userId,
		contactId: params.contactId,
		email: params.email,
		firstName: params.firstName,
		lastName: params.lastName,
	});
	if (!resolved.ok) {
		if (resolved.reason === "contact_required") {
			throw AutomationErrors.contactRequired();
		}
		throw AutomationErrors.contactNotFound();
	}

	const contact = resolved.contact;
	if (contact.status === "unsubscribed" || contact.status === "blocked") {
		throw AutomationErrors.contactNotSendable(contact.status);
	}
	if (contact.suppressionReason) {
		throw AutomationErrors.contactNotSendable("suppressed");
	}

	const outcome = await enrollContactInAutomation({
		automation,
		contactId: contact.id,
		organizationId: params.organizationId,
	});

	if (outcome.status === "skipped") {
		if (outcome.reason === "already_enrolled") {
			throw AutomationErrors.alreadyEnrolled(
				outcome.existingEnrollmentId ?? "unknown",
			);
		}
		if (outcome.reason === "no_steps" || outcome.reason === "missing_node") {
			throw AutomationErrors.cannotEnroll(
				"This automation has no sendable steps after the trigger.",
			);
		}
		throw AutomationErrors.cannotEnroll(
			"This automation has no published version to enroll against.",
		);
	}

	const enrollment = await db.query.automationEnrollment.findFirst({
		where: eq(schema.automationEnrollment.id, outcome.enrollmentId),
	});
	if (!enrollment) {
		throw AutomationErrors.enrollmentNotFound(outcome.enrollmentId);
	}

	return {
		enrollment: mapEnrollment({ row: enrollment, contact }),
		contactCreated: resolved.created,
		delayMs: outcome.delayMs,
	};
}
