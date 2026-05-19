import {
	AuthErrors,
	ContactErrors,
} from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { verifyToken } from "../token.utils";

export async function getPreferencesDataController({
	token,
}: {
	token: string;
}) {
	const log = useLogger();
	log.info("Fetching preferences data");

	const payload = await verifyToken(token);
	if (!payload) {
		throw AuthErrors.unauthorized("Invalid or expired preferences token");
	}

	const { contactId, organizationId } = payload;

	// Fetch contact
	const contact = await db.query.contact.findFirst({
		where: and(
			eq(schema.contact.id, contactId),
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
		),
	});

	if (!contact) {
		throw ContactErrors.contactNotFound(contactId);
	}

	// Fetch organization name
	const [org] = await db
		.select({ name: schema.organization.name })
		.from(schema.organization)
		.where(eq(schema.organization.id, organizationId))
		.limit(1);

	// Fetch all PUBLIC channels for the org
	const channels = await db.query.channel.findMany({
		where: and(
			eq(schema.channel.organizationId, organizationId),
			eq(schema.channel.visibility, "public"),
			isNull(schema.channel.deletedAt),
		),
	});

	// Fetch contact's enrollments for those channels
	const enrollments = await db.query.channelSubscription.findMany({
		where: and(
			eq(schema.channelSubscription.contactId, contactId),
			eq(schema.channelSubscription.organizationId, organizationId),
			isNull(schema.channelSubscription.deletedAt),
		),
	});

	const enrollmentMap = new Map(
		enrollments.map((e) => [e.channelId, e.status]),
	);

	log.info("Preferences data fetched successfully", {
		contactId,
		channelsCount: channels.length,
	});

	return {
		contact: {
			email: contact.email,
			firstName: contact.firstName,
			lastName: contact.lastName,
		},
		organization: {
			name: org?.name ?? "Reloop",
		},
		channels: channels.map((channel) => ({
			id: channel.id,
			name: channel.name,
			description: channel.description,
			defaultSubscription: channel.defaultSubscription,
			// enrolled | unenrolled | none (never touched)
			status: enrollmentMap.get(channel.id) ?? "none",
		})),
	};
}
