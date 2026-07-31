import {
	cancelEnrollmentsForContact,
	enrollContactInMatchingAutomations,
} from "@be/workflow/handlers/automation/enroll";
import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";

const QUEUE = { queue: "automation-enroll-workers" };

export async function initAutomationSubscribers(): Promise<void> {
	await bus.subscribe(
		BusEvent.CONTACT_CREATED,
		async (payload) => {
			log.info({
				message: "Automation trigger received",
				triggerEvent: "contact.create",
				contactId: payload.contactId,
				organizationId: payload.organizationId,
			});
			await enrollContactInMatchingAutomations({
				organizationId: payload.organizationId,
				contactId: payload.contactId,
				triggerEvent: "contact.create",
			});
		},
		QUEUE,
	);

	await bus.subscribe(
		BusEvent.CONTACT_UPDATED,
		async (payload) => {
			await enrollContactInMatchingAutomations({
				organizationId: payload.organizationId,
				contactId: payload.contactId,
				triggerEvent: "contact.update",
			});
		},
		QUEUE,
	);

	await bus.subscribe(
		BusEvent.CONTACT_SUBSCRIBED,
		async (payload) => {
			await enrollContactInMatchingAutomations({
				organizationId: payload.organizationId,
				contactId: payload.contactId,
				triggerEvent: "contact.subscribed",
			});
		},
		QUEUE,
	);

	// Cancel in-flight sequences when contact can no longer receive mail
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

	log.info("subscriber", "Automation subscribers initialized");
}
