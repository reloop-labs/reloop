import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function checkRecipientController(
	email: string,
): Promise<{ allowed: boolean }> {
	const log = useLogger();
	log.info(`[CHECK-RECIPIENT] Checking recipient: ${email}`);

	try {
		const normalizedEmail = email.toLowerCase().trim();
		const mailboxRecord = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.email, normalizedEmail),
				eq(mailbox.status, "active"),
			),
			columns: { id: true },
		});

		const allowed = !!mailboxRecord;
		log.info(
			`[CHECK-RECIPIENT] Recipient check result: ${email} -> allowed=${allowed}`,
		);
		return { allowed };
	} catch (e) {
		log.error(
			`[CHECK-RECIPIENT] Error checking recipient ${email}: ${e instanceof Error ? e.message : String(e)}`,
		);
		throw createError({
			status: 500,
			message: "Internal server error during recipient check",
			why: e instanceof Error ? e.message : String(e),
			fix: "Check domain service logs",
		});
	}
}
