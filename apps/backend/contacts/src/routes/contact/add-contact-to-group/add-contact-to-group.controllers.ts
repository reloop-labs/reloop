import {
	ContactErrors,
	GroupErrors,
} from "@be/contacts/error/contacts.error-response";
import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function addContactToGroupController({
	organizationId,
	groupId,
	contact_id,
	email,
}: {
	organizationId: string;
	groupId: string;
} & ContactModel.AddContactToGroupBody): Promise<ContactModel.AddContactToGroupResponse> {
	const log = useLogger();

	if (!contact_id && !email) {
		log.info("Either 'contact_id' or 'email' must be provided", {});
		throw ContactErrors.invalidEmail(
			"",
			"Either 'contact_id' or 'email' must be provided",
		);
	}

	try {
		log.info("Verify group exists", {
			contactId: contact_id,
			email,
			groupId,
		});
		// Verify group exists
		const group = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, groupId),
				eq(schema.group.organizationId, organizationId),
				isNull(schema.group.deletedAt),
			),
		});

		if (!group) {
			log.info("Group not found", { groupId });
			throw GroupErrors.notFound(groupId);
		}

		let contact: typeof schema.contact.$inferSelect | undefined;

		if (contact_id) {
			log.info("Find contact by id", { contactId: contact_id });
			contact = await db.query.contact.findFirst({
				where: and(
					eq(schema.contact.id, contact_id),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			});
		} else if (email) {
			log.info("Find contact by email", { email });
			contact = await db.query.contact.findFirst({
				where: and(
					eq(schema.contact.email, email),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			});
		}

		if (!contact) {
			throw ContactErrors.contactNotFound(contact_id || email || "");
		}

		log.info("Checking if contact is already in group", {
			contactId: contact.id,
			groupId,
		});
		const existing = await db.query.contactGroup.findFirst({
			where: and(
				eq(schema.contactGroup.contactId, contact.id),
				eq(schema.contactGroup.groupId, groupId),
				isNull(schema.contactGroup.deletedAt),
			),
		});

		if (existing) {
			return {
				success: true,
				object: "contact" as const,
				id: contact.id,
				event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
			};
		}

		log.info("Adding contact to group", { contactId: contact.id, groupId });
		await db
			.insert(schema.contactGroup)
			.values({
				contactId: contact.id,
				groupId,
				organizationId,
				userId: contact.userId,
			})
			.onConflictDoUpdate({
				target: [schema.contactGroup.contactId, schema.contactGroup.groupId],
				set: {
					deletedAt: null,
					updatedAt: new Date(),
				},
			});

		log.info("Contact added to group", { contactId: contact.id, groupId });

		const result = {
			success: true,
			object: "contact" as const,
			id: contact.id,
			event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Error adding contact to group", {
			contactId: contact_id,
			email: email?.toLowerCase(),
			groupId,
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
