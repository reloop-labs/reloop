import type { ContactModel } from "@be/contacts/model/contact.model";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { log } from "evlog";
import { useLogger } from "evlog/elysia";

export async function addContactToGroupController({
	organizationId,
	groupId,
	body,
	cookie,
	requestDetails,
}: {
	organizationId: string;
	groupId: string;
	body: ContactModel.AddContactToGroupBody;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<ContactModel.AddContactToGroupResponse> {
	const logger = useLogger();
	const { contact_id, email } = body;

	if (!contact_id && !email) {
		logger?.info("Either 'contact_id' or 'email' must be provided", {  });
		throw status(400, {
			message: "Either 'contact_id' or 'email' must be provided",
		});
	}

	try {
		logger?.info("Verify group exists", { contactId: contact_id, email, groupId });
		// Verify group exists
		const group = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, groupId),
				eq(schema.group.organizationId, organizationId),
				isNull(schema.group.deletedAt),
			),
		});

		if (!group) {
			logger?.info("Group not found", { groupId });
			throw status(404, { message: "Group not found" });
		}

		let contact: typeof schema.contact.$inferSelect | undefined;

		if (contact_id) {
			logger?.info("Find contact by id", { contactId: contact_id });
			contact = await db.query.contact.findFirst({
				where: and(
					eq(schema.contact.id, contact_id),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			});
		} else if (email) {
			logger?.info("Find contact by email", { email });
			contact = await db.query.contact.findFirst({
				where: and(
					eq(schema.contact.email, email),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			});
		}

		if (!contact) {
			throw status(404, { message: "Contact not found" });
		}

		logger?.info("Checking if contact is already in group", { contactId: contact.id, groupId });
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

		logger?.info("Adding contact to group", { contactId: contact.id, groupId });
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

		logger?.info("Contact added to group", { contactId: contact.id, groupId });

		const result = {
			success: true,
			object: "contact" as const,
			id: contact.id,
			event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 200 },
		});

		return result;
	} catch (error) {
		log.error({
			message: "Error adding contact to group",
			contactId: contact_id,
			email: email?.toLowerCase(),
			groupId,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
