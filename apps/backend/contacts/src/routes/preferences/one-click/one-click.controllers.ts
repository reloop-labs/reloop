import { AuthErrors } from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { verifyToken } from "../token.utils";

/**
 * RFC 8058 one-click unsubscribe.
 *
 * Gmail/Yahoo POST to the `List-Unsubscribe` URL with body
 * `List-Unsubscribe=One-Click`. No auth — the signed token is the credential.
 * Always idempotent: already-unsubscribed contacts still return success.
 *
 * Unsubscribes from the main contacts list (`contact.status`) AND unenrolls
 * all channel subscriptions, matching the preferences-page "unsubscribe all"
 * behavior.
 */
export async function oneClickUnsubscribeController({
	token,
}: {
	token: string;
}) {
	const log = useLogger();
	log.info("Processing one-click unsubscribe");

	const payload = await verifyToken(token);
	if (!payload) {
		throw AuthErrors.unauthorized("Invalid or expired preferences token");
	}

	const { contactId, organizationId } = payload;

	const contact = await db.query.contact.findFirst({
		where: and(
			eq(schema.contact.id, contactId),
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
		),
	});

	// Token is opaque — don't reveal whether the contact exists.
	// Return success so providers don't retry a dead URL.
	if (!contact) {
		log.info("One-click unsubscribe for unknown contact (suppressed)");
		return { success: true };
	}

	if (contact.status !== "unsubscribed") {
		await db
			.update(schema.contact)
			.set({ status: "unsubscribed", updatedAt: new Date() })
			.where(
				and(
					eq(schema.contact.id, contactId),
					eq(schema.contact.organizationId, organizationId),
				),
			);
	}

	await db
		.update(schema.channelSubscription)
		.set({ status: "unenrolled", updatedAt: new Date() })
		.where(
			and(
				eq(schema.channelSubscription.contactId, contactId),
				eq(schema.channelSubscription.organizationId, organizationId),
				isNull(schema.channelSubscription.deletedAt),
			),
		);

	log.info("One-click unsubscribe completed", { contactId });

	return { success: true };
}
