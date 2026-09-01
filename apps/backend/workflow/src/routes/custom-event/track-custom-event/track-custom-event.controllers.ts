import { CustomEventErrors } from "@be/workflow/error/custom-event.error-response";
import { enrollContactInMatchingAutomations } from "@be/workflow/handlers/automation/enroll";
import { resolveOrCreateContact } from "@be/workflow/lib/automation/resolve-contact";
import { validateTrackProperties } from "@be/workflow/lib/custom-event/validate-properties";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

/**
 * Track a workflow-only custom event.
 * Does not touch webhooks — enrolls matching automations only.
 * If only an email is provided, the contact is created (or restored) first.
 */
export async function trackCustomEventController(params: {
	organizationId: string;
	userId: string;
	eventKey: string;
	contactId?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	properties?: Record<string, unknown>;
}) {
	const key = params.eventKey.trim().toLowerCase();

	const eventDef = await db.query.customEvent.findFirst({
		where: and(
			eq(schema.customEvent.organizationId, params.organizationId),
			eq(schema.customEvent.key, key),
			isNull(schema.customEvent.deletedAt),
		),
	});
	if (!eventDef) throw CustomEventErrors.notFound(key);

	const propertyDefs = await db.query.customEventProperty.findMany({
		where: eq(schema.customEventProperty.eventId, eventDef.id),
	});

	const validated = validateTrackProperties({
		defs: propertyDefs,
		properties: params.properties,
	});
	if (!validated.ok) {
		throw CustomEventErrors.invalidProperties(validated.error);
	}

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
			throw CustomEventErrors.contactRequired();
		}
		throw CustomEventErrors.contactNotFound();
	}

	const enrollments = await enrollContactInMatchingAutomations({
		organizationId: params.organizationId,
		contactId: resolved.contact.id,
		triggerEvent: eventDef.key,
		properties: validated.normalized,
	});

	return {
		success: true,
		eventId: eventDef.id,
		eventKey: eventDef.key,
		contactId: resolved.contact.id,
		contactCreated: resolved.created,
		enrollments,
		properties: validated.normalized,
	};
}
