import { db } from "@reloop/db/client";
import { pendingOutboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function cancelPendingController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	const existing = await db.query.pendingOutboundEmail.findFirst({
		where: and(
			eq(pendingOutboundEmail.id, id),
			eq(pendingOutboundEmail.organizationId, organizationId),
		),
	});

	if (!existing) {
		throw createError({
			status: 404,
			message: "Pending email not found",
			why: `Pending outbound email ${id} was not found`,
			fix: "Verify the pending email ID",
		});
	}

	if (existing.status !== "pending") {
		throw createError({
			status: 400,
			message: "Cannot cancel email",
			why: `Pending outbound email ${id} has status ${existing.status}`,
			fix: "Only emails with status pending can be cancelled",
		});
	}

	const [updated] = await db
		.update(pendingOutboundEmail)
		.set({ status: "cancelled" })
		.where(eq(pendingOutboundEmail.id, id))
		.returning();

	if (!updated) {
		throw createError({
			status: 500,
			message: "Failed to cancel pending email",
			why: "Update returned no row",
			fix: "Retry the request",
		});
	}

	log.info(`[PENDING] Cancelled pending outbound ${id}`);
	return { success: true, id };
}
