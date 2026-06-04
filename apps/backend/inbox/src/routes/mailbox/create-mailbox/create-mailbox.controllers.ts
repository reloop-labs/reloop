import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function createMailboxController({
	organizationId,
	domainId,
	email,
	password,
	quota,
	displayName,
	description,
}: {
	organizationId: string;
	domainId: string;
	email: string;
	password?: string;
	quota?: string;
	displayName?: string;
	description?: string;
}) {
	const log = useLogger();

	const existing = await db.query.mailbox.findFirst({
		where: eq(mailbox.email, email),
	});

	if (existing) {
		throw createError({
			status: 409,
			message: "Mailbox already exists",
			why: `A mailbox with email ${email} already exists`,
			fix: "Use a different email address or delete the existing mailbox first",
		});
	}

	const inserted = await db
		.insert(mailbox)
		.values({
			organizationId,
			domainId,
			email,
			password: password || "placeholder", // In a real app, hash this
			quota: quota || "5 GB",
			displayName,
			description,
		})
		.returning({ id: mailbox.id });

	const id = inserted[0]?.id;
	if (!id) {
		throw createError({
			status: 500,
			message: "Failed to create mailbox",
			why: "Database insert returned no ID",
			fix: "Please try again or contact support",
		});
	}

	await bus.publish(BusEvent.MAILBOX_CREATED, {
		mailboxId: id,
		organizationId,
		email,
	});

	log.info(`[MAILBOX] Created mailbox ${email} (Org: ${organizationId})`);
	return { id, email, status: "active" };
}
