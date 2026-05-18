import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { log } from "evlog";
import { verifyToken } from "../token.utils";

export async function getPreferencesDataController({
	token,
	logger,
}: {
	token: string;
	logger?: any;
}) {
	log.info("server", "Fetching preferences data");

	const payload = await verifyToken(token);
	if (!payload) {
		throw status(401, { message: "Invalid or expired preferences token" });
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
		throw status(404, { message: "Contact not found" });
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

	logger?.info("Preferences data fetched successfully", { contactId, channelsCount: channels.length });

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
