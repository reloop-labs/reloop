import { enrollContactInMatchingAutomations } from "@be/workflow/handlers/automation/enroll";
import { CustomEventErrors } from "@be/workflow/error/custom-event.error-response";
import { validateTrackProperties } from "@be/workflow/lib/custom-event/validate-properties";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, eq, isNull } from "drizzle-orm";

/**
 * Track a workflow-only custom event.
 * Does not touch webhooks — enrolls matching automations only.
 */
export async function trackCustomEventController(params: {
	organizationId: string;
	userId: string;
	eventKey: string;
	contactId?: string;
	email?: string;
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

	const contact = await resolveContact({
		organizationId: params.organizationId,
		contactId: params.contactId,
		email: params.email,
	});

	const before = await countActiveEnrollments(
		params.organizationId,
		contact.id,
	);
	await enrollContactInMatchingAutomations({
		organizationId: params.organizationId,
		contactId: contact.id,
		triggerEvent: eventDef.key,
	});
	const after = await countActiveEnrollments(params.organizationId, contact.id);
	const enrollments = Math.max(0, after - before);

	return {
		success: true,
		eventId: eventDef.id,
		eventKey: eventDef.key,
		contactId: contact.id,
		enrollments,
		properties: validated.normalized,
	};
}

async function resolveContact(params: {
	organizationId: string;
	contactId?: string;
	email?: string;
}) {
	if (!params.contactId && !params.email) {
		throw CustomEventErrors.contactRequired();
	}

	if (params.contactId) {
		const contact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.id, params.contactId),
				eq(schema.contact.organizationId, params.organizationId),
				isNull(schema.contact.deletedAt),
			),
		});
		if (!contact) throw CustomEventErrors.contactNotFound();
		return contact;
	}

	const email = params.email!.trim().toLowerCase();
	const contact = await db.query.contact.findFirst({
		where: and(
			eq(schema.contact.email, email),
			eq(schema.contact.organizationId, params.organizationId),
			isNull(schema.contact.deletedAt),
		),
	});
	if (!contact) throw CustomEventErrors.contactNotFound();
	return contact;
}

async function countActiveEnrollments(
	organizationId: string,
	contactId: string,
): Promise<number> {
	const [row] = await db
		.select({ total: count() })
		.from(schema.automationEnrollment)
		.where(
			and(
				eq(schema.automationEnrollment.organizationId, organizationId),
				eq(schema.automationEnrollment.contactId, contactId),
				eq(schema.automationEnrollment.status, "active"),
			),
		);
	return Number(row?.total ?? 0);
}
