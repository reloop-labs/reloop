import { writeAdminAudit } from "@reloop/admin/utils/audit";
import { db } from "@reloop/db/client";
import { contact, organization } from "@reloop/db/schema";
import {
	and,
	count,
	desc,
	eq,
	ilike,
	isNotNull,
	isNull,
	or,
	sql,
} from "drizzle-orm";
import { createError } from "evlog";

type SuppressionReason = "hard_bounce" | "spam_complaint" | "mailbox_full";

/**
 * Same definition the mail service enforces platform-wide at send time
 * (step-2b-check-suppressions): blocked, or carrying a suppression reason.
 */
const isSuppressed = or(
	eq(contact.status, "blocked"),
	isNotNull(contact.suppressionReason),
);

export async function listSuppressionsController({
	limit = 50,
	offset = 0,
	q,
	reason,
}: {
	limit?: number;
	offset?: number;
	q?: string;
	reason?: SuppressionReason | "blocked";
}) {
	// Deleted contacts are kept on purpose: the send-time check ignores
	// deletedAt, so a deleted suppressed contact still blocks the address.
	const conditions = [isSuppressed];
	if (reason === "blocked") {
		conditions.push(
			and(eq(contact.status, "blocked"), isNull(contact.suppressionReason)),
		);
	} else if (reason) {
		conditions.push(eq(contact.suppressionReason, reason));
	}
	if (q) {
		const escaped = q.trim().replace(/[%_\\]/g, "\\$&");
		conditions.push(ilike(contact.email, `%${escaped}%`));
	}
	const whereClause = and(...conditions);

	const [totalRow] = await db
		.select({ value: count() })
		.from(contact)
		.where(whereClause);

	const items = await db
		.select({
			id: contact.id,
			email: contact.email,
			status: contact.status,
			suppressionReason: contact.suppressionReason,
			suppressedAt: contact.suppressedAt,
			updatedAt: contact.updatedAt,
			organizationId: contact.organizationId,
			organizationName: organization.name,
		})
		.from(contact)
		.innerJoin(organization, eq(contact.organizationId, organization.id))
		.where(whereClause)
		.orderBy(
			sql`${contact.suppressedAt} desc nulls last`,
			desc(contact.updatedAt),
		)
		.limit(limit)
		.offset(offset);

	return {
		items,
		total: totalRow?.value ?? 0,
	};
}

/**
 * Suppression is enforced platform-wide by email, so removing it for one row
 * is not enough: any other org's suppressed row for the same address would
 * still block the send. Clears every automatic suppression for the address,
 * plus the selected row even if it was a manual block.
 */
export async function removeSuppressionController({
	contactId,
	actorUserId,
}: {
	contactId: string;
	actorUserId: string;
}) {
	const existing = await db.query.contact.findFirst({
		where: eq(contact.id, contactId),
		columns: {
			id: true,
			email: true,
			status: true,
			suppressionReason: true,
			organizationId: true,
		},
	});
	if (!existing) {
		throw createError({
			status: 404,
			message: "Contact not found",
			why: `No contact with id ${contactId}`,
			fix: "Refresh the suppression list and try again",
		});
	}

	const email = existing.email.toLowerCase();
	const cleared = await db
		.update(contact)
		.set({
			status: "subscribed",
			suppressionReason: null,
			suppressedAt: null,
			updatedAt: new Date(),
		})
		.where(
			or(
				eq(contact.id, contactId),
				and(
					sql`lower(${contact.email}) = ${email}`,
					isNotNull(contact.suppressionReason),
				),
			),
		)
		.returning({ id: contact.id, organizationId: contact.organizationId });

	await writeAdminAudit({
		actorUserId,
		action: "suppression.removed",
		resourceType: "contact",
		resourceId: contactId,
		organizationId: existing.organizationId,
		metadata: {
			email,
			previousStatus: existing.status,
			previousReason: existing.suppressionReason,
			clearedContactIds: cleared.map((row) => row.id),
		},
	});

	return { success: true, cleared: cleared.length };
}
