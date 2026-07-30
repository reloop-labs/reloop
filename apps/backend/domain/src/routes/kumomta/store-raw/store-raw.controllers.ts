import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

/**
 * Persist the final SMTP MIME for an email log (post tracking / DKIM).
 * Called by KumoMTA after the message is fully prepared for egress.
 */
export async function storeRawController({
	emailLogId,
	rawMessage,
	organizationId,
}: {
	emailLogId: string;
	rawMessage: string;
	organizationId: string;
}): Promise<{ ok: true }> {
	const log = useLogger();

	if (!rawMessage) {
		throw createError({
			status: 400,
			message: "Raw message is required",
			why: "store-raw was called without a rawMessage body.",
			fix: "Send the full MIME payload in rawMessage.",
		});
	}

	const updated = await db
		.update(emailLog)
		.set({
			rawMessage,
			size: rawMessage.length,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(emailLog.id, emailLogId),
				eq(emailLog.organizationId, organizationId),
			),
		)
		.returning({ id: emailLog.id });

	if (!updated[0]) {
		log.warn(
			`[STORE-RAW] Email log not found: ${emailLogId} (org ${organizationId})`,
		);
		throw createError({
			status: 404,
			message: "Email log not found",
			why: `No email log ${emailLogId} exists for this organization.`,
			fix: "Ensure log-incoming (or mail inject) created the log first.",
		});
	}

	log.info(
		`[STORE-RAW] Saved raw message for ${emailLogId} (${rawMessage.length} bytes)`,
	);
	return { ok: true };
}
