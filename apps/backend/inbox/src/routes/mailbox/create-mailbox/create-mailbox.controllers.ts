import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { domain, mailbox } from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function createMailboxController({
	organizationId,
	domainId,
	email,
	password,
	quota,
	displayName,
}: {
	organizationId: string;
	domainId: string;
	email: string;
	password?: string;
	quota?: string;
	displayName?: string;
}) {
	const log = useLogger();

	const domainRecord = await db.query.domain.findFirst({
		where: and(
			eq(domain.id, domainId),
			eq(domain.organizationId, organizationId),
			isNull(domain.deletedAt),
		),
		columns: {
			id: true,
			domain: true,
			isSendingEmailEnabled: true,
			isReceivingEmailEnabled: true,
		},
	});

	if (!domainRecord) {
		throw createError({
			status: 400,
			message: "Domain not found",
			why: `No domain with id ${domainId} exists for this organization`,
			fix: "Select a valid domain from Domain settings",
		});
	}

	if (
		!domainRecord.isSendingEmailEnabled ||
		!domainRecord.isReceivingEmailEnabled
	) {
		const missing: string[] = [];
		if (!domainRecord.isSendingEmailEnabled) missing.push("sending");
		if (!domainRecord.isReceivingEmailEnabled) missing.push("receiving");
		throw createError({
			status: 400,
			message: "Domain must have sending and receiving enabled to create a mailbox",
			why: `Domain ${domainRecord.domain} is missing ${missing.join(" and ")}`,
			fix: "Enable both sending and receiving in Domain settings, then try again",
		});
	}

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
