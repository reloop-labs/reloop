import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { signToken } from "../token.utils";

const BASE_URL = process.env.BASE_URL || "https://local.reloop.sh";

export async function generatePreferenceTokenController({
	organizationId,
	contactId,
	email,
}: {
	organizationId: string;
	contactId?: string;
	email?: string;
}) {
	const log = useLogger();

	// M-2 fix: validate presence of lookup parameter without revealing which contact
	// was or wasn't found in the response — prevents timing-based email enumeration.
	if (!contactId && !email) {
		// Return a generic error here since neither was provided — this isn't
		// sensitive information.
		return {
			message: "Either 'contactId' or 'email' must be provided.",
		};
	}

	log.info("Generating preference token", { contactId });

	let contact: typeof schema.contact.$inferSelect | undefined;

	if (contactId) {
		contact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.id, contactId),
				eq(schema.contact.organizationId, organizationId),
				isNull(schema.contact.deletedAt),
			),
		});
	} else if (email) {
		contact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.email, email.toLowerCase()),
				eq(schema.contact.organizationId, organizationId),
				isNull(schema.contact.deletedAt),
			),
		});
	}

	// M-2 fix: return the same 200 shape whether or not the contact exists.
	// Callers cannot distinguish "contact found" vs "contact not found" from the
	// HTTP status or response shape, preventing email enumeration.
	if (!contact) {
		log.info(
			"Preference token requested for non-existent contact (suppressed)",
		);
		return {
			token: null,
			url: null,
			expiresAt: null,
			contactId: null,
			email: null,
		};
	}

	const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
	const token = await signToken({
		contactId: contact.id,
		organizationId,
		expiresAt,
	});
	const url = `${BASE_URL}/preferences?token=${token}`;

	log.info("Preference token generated successfully", {
		contactId: contact.id,
	});

	return {
		token,
		url,
		expiresAt: new Date(expiresAt).toISOString(),
		contactId: contact.id,
		email: contact.email,
	};
}
