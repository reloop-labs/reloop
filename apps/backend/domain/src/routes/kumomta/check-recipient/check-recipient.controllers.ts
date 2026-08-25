import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { domainConfig } from "@reloop/domain/domain.config";

const toolsRedis = new RedisCache("tools", 86400, domainConfig.REDIS_URL);
const TESTER_DOMAINS = [
	"mail-test.reloop.email",
	"mailtest.reloop.sh",
	"mailtest.local",
	"mailtest.reloop.local",
];

export async function checkRecipientController(
	email: string,
): Promise<{ allowed: boolean }> {
	const log = useLogger();
	log.info(`[CHECK-RECIPIENT] Checking recipient: ${email}`);

	try {
		const normalizedEmail = email.toLowerCase().trim();
		const [localPart, domainPart] = normalizedEmail.split("@");

		if (domainPart && localPart && TESTER_DOMAINS.includes(domainPart)) {
			// Extract token from test-<token> or raw <token>
			const token = localPart.replace(/^test[-_]/, "");
			if (token) {
				const session = await toolsRedis.get<{ status?: string }>(
					`deliverability-test:${token}`,
				);
				if (session && session.status !== "expired") {
					log.info(
						`[CHECK-RECIPIENT] Allowed tester token recipient: ${email} (status: ${session.status})`,
					);
					return { allowed: true };
				}
			}
			log.warn(
				`[CHECK-RECIPIENT] Rejected tester recipient (no active session): ${email}`,
			);
			return { allowed: false };
		}

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
