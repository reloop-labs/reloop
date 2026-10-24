import { db } from "@reloop/db/client";
import { mailAccount, mailbox } from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createError, log as evlog } from "evlog";
import { useLogger } from "evlog/elysia";

function getLogger() {
	try {
		return useLogger();
	} catch {
		return {
			info: (msg: string) => evlog.info("domain", msg),
			error: (msg: string) => evlog.error("domain", msg),
			warn: (msg: string) => evlog.warn("domain", msg),
		};
	}
}

/** IMAP mail accounts (apps/backend/imap), with the same plus-address fallback. */
async function isActiveMailAccount(email: string): Promise<boolean> {
	const [localPart, domainPart] = email.split("@");
	const candidates = [email];
	if (localPart?.includes("+") && domainPart) {
		candidates.push(`${localPart.split("+")[0]}@${domainPart}`);
	}
	const account = await db.query.mailAccount.findFirst({
		where: and(
			inArray(mailAccount.email, candidates),
			eq(mailAccount.status, "active"),
		),
		columns: { id: true },
	});
	return !!account;
}

export async function checkRecipientController(
	email: string,
): Promise<{ allowed: boolean }> {
	const log = getLogger();
	log.info(`[CHECK-RECIPIENT] Checking recipient: ${email}`);

	try {
		const normalizedEmail = email.toLowerCase().trim();

		let mailboxRecord = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.email, normalizedEmail),
				eq(mailbox.status, "active"),
			),
			columns: { id: true },
		});

		// Fallback: If recipient is plus-addressed (e.g. user+alias@domain.com), try base email
		if (!mailboxRecord && normalizedEmail.includes("+")) {
			const [localPart, domainPart] = normalizedEmail.split("@");
			if (localPart && domainPart) {
				const baseLocalPart = localPart.split("+")[0];
				const baseEmail = `${baseLocalPart}@${domainPart}`;
				mailboxRecord = await db.query.mailbox.findFirst({
					where: and(
						eq(mailbox.email, baseEmail),
						eq(mailbox.status, "active"),
					),
					columns: { id: true },
				});
			}
		}

		const allowed =
			!!mailboxRecord || (await isActiveMailAccount(normalizedEmail));
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
