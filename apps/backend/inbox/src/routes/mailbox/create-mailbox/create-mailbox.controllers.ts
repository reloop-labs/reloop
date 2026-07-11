import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { domain, mailbox } from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

/** RFC 5321/5322 unquoted local-part (dot-atom), max 64 chars */
const EMAIL_LOCAL_PART_REGEX =
	/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

function assertValidMailboxEmail(email: string, domainName: string) {
	const trimmed = email.trim();
	if (trimmed.length > 254) {
		throw createError({
			status: 400,
			message: "Invalid email address",
			why: "Email address exceeds the maximum length of 254 characters",
			fix: "Use a shorter local part",
		});
	}

	const at = trimmed.lastIndexOf("@");
	if (at <= 0 || at === trimmed.length - 1) {
		throw createError({
			status: 400,
			message: "Invalid email address",
			why: "Email must be in the form local@domain",
			fix: "Provide a valid mailbox email address",
		});
	}

	const localPart = trimmed.slice(0, at);
	const domainPart = trimmed.slice(at + 1);

	if (domainPart.toLowerCase() !== domainName.toLowerCase()) {
		throw createError({
			status: 400,
			message: "Invalid email address",
			why: `Email domain ${domainPart} does not match selected domain ${domainName}`,
			fix: "Use the selected domain for the mailbox email",
		});
	}

	if (localPart.length < 1 || localPart.length > 64) {
		throw createError({
			status: 400,
			message: "Invalid email address",
			why: "Email local part must be between 1 and 64 characters",
			fix: "Use a local part that is 1–64 characters long",
		});
	}

	if (
		/\s/.test(localPart) ||
		localPart.startsWith(".") ||
		localPart.endsWith(".") ||
		localPart.includes("..") ||
		!EMAIL_LOCAL_PART_REGEX.test(localPart)
	) {
		throw createError({
			status: 400,
			message: "Invalid email address",
			why: `Local part "${localPart}" is not a valid email local part`,
			fix: "Use letters, numbers, and allowed symbols; dots can't start, end, or repeat",
		});
	}
}

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
			message:
				"Domain must have sending and receiving enabled to create a mailbox",
			why: `Domain ${domainRecord.domain} is missing ${missing.join(" and ")}`,
			fix: "Enable both sending and receiving in Domain settings, then try again",
		});
	}

	assertValidMailboxEmail(email, domainRecord.domain);

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
