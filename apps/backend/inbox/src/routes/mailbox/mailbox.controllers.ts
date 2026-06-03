import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { eq, and } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { bus, BusEvent } from "@reloop/bus";
import { createError } from "evlog";

export async function createMailboxController({
	organizationId,
	domainId,
	email,
	password,
	quota,
}: {
	organizationId: string;
	domainId: string;
	email: string;
	password?: string;
	quota?: string;
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

export async function getMailboxesController(organizationId: string) {
	const mailboxes = await db.query.mailbox.findMany({
		where: eq(mailbox.organizationId, organizationId),
		orderBy: (m, { desc }) => [desc(m.createdAt)],
	});

	return mailboxes.map(m => ({
		id: m.id,
		email: m.email,
		quota: m.quota,
		status: m.status,
		createdAt: m.createdAt,
	}));
}

export async function deleteMailboxController(id: string, organizationId: string) {
	const log = useLogger();
	
	const mbx = await db.query.mailbox.findFirst({
		where: and(eq(mailbox.id, id), eq(mailbox.organizationId, organizationId)),
	});

	if (!mbx) {
		throw createError({
			status: 404,
			message: "Mailbox not found",
			why: `Mailbox ${id} was not found in your organization`,
			fix: "Verify the mailbox ID and ensure it belongs to your organization",
		});
	}

	await db.delete(mailbox).where(eq(mailbox.id, id));

	await bus.publish(BusEvent.MAILBOX_DELETED, {
		mailboxId: id,
		organizationId,
		email: mbx.email,
	});

	log.info(`[MAILBOX] Deleted mailbox ${mbx.email} (Org: ${organizationId})`);
	return { success: true };
}
