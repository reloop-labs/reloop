import type { ContactModel } from "@be/contacts/model/contact.model";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { log } from "evlog";

export async function addContactToGroupController({
	organizationId,
	groupId,
	body,
	logger,
	cookie,
	requestDetails,
}: {
	organizationId: string;
	groupId: string;
	body: ContactModel.AddContactToGroupBody;
	logger?: any;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<ContactModel.AddContactToGroupResponse> {
	const { contact_id, email } = body;

	if (!contact_id && !email) {
		log.info({
			...{},
			message: "Either 'contact_id' or 'email' must be provided",
		});
		throw status(400, {
			message: "Either 'contact_id' or 'email' must be provided",
		});
	}

	try {
		log.info({
			...{ contactId: contact_id, email, groupId },
			message: "Verify group exists",
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
			log.info({ ...{ groupId }, message: "Group not found" });
			throw status(404, { message: "Group not found" });
		}

		let contact: typeof schema.contact.$inferSelect | undefined;

		if (contact_id) {
			log.info({ ...{ contactId: contact_id }, message: "Find contact by id" });
			contact = await db.query.contact.findFirst({
				where: and(
					eq(schema.contact.id, contact_id),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			});
		} else if (email) {
			log.info({ ...{ email }, message: "Find contact by email" });
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

		log.info({
			...{ contactId: contact.id, groupId },
			message: "Checking if contact is already in group",
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

		log.info({
			...{ contactId: contact.id, groupId },
			message: "Adding contact to group",
		});
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

		log.info({
			...{ contactId: contact.id, groupId },
			message: "Contact added to group",
		});

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
		log.error(
			{
				contactId: contact_id,
				email: email?.toLowerCase(),
				groupId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error adding contact to group",
		);
		throw error;
	}
}
