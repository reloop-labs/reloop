import { cancelEnrollmentsForContact } from "@be/workflow/handlers/automation/enroll";
import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";

const QUEUE = { queue: "automation-enroll-workers" };

/**
 * Automations no longer enroll from platform webhook-events (contact.create, etc.).
 * Enrollment happens when a user-defined custom event is tracked via
 * POST /api/workflow/v1/events/track.
 *
 * We still cancel in-flight enrollments when a contact can no longer receive mail.
 */
export async function initAutomationSubscribers(): Promise<void> {
	await bus.subscribe(
		BusEvent.CONTACT_UNSUBSCRIBED,
		async (payload) => {
			await cancelEnrollmentsForContact({
				organizationId: payload.organizationId,
				contactId: payload.contactId,
				reason: "unsubscribed",
			});
		},
		QUEUE,
	);

	await bus.subscribe(
		BusEvent.CONTACT_BLOCKED,
		async (payload) => {
			await cancelEnrollmentsForContact({
				organizationId: payload.organizationId,
				contactId: payload.contactId,
				reason: "blocked",
			});
		},
		QUEUE,
	);

	await bus.subscribe(
		BusEvent.CONTACT_DELETED,
		async (payload) => {
			await cancelEnrollmentsForContact({
				organizationId: payload.organizationId,
				contactId: payload.contactId,
				reason: "deleted",
			});
		},
		QUEUE,
	);

	log.info(
		"subscriber",
		"Automation subscribers initialized (cancel-only; enroll via custom events)",
	);
}
