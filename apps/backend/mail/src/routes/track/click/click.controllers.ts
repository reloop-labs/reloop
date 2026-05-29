import {
	type ClickTrackingPayload,
	decodeTrackingToken,
} from "@reloop/be-mail/lib/crypto";
import { MailErrors } from "@reloop/be-mail/lib/errors";
import { mailConfig } from "@reloop/be-mail/mail.config";
import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

export async function handleClickTracking({ token }: { token: string }) {
	const payload = decodeTrackingToken<ClickTrackingPayload>(
		token,
		mailConfig.TRACKING_SECRET,
	);

	if (!payload || !payload.url) {
		log.warn({
			...{ token },
			message: "Click tracking rejected: Invalid or tampered token",
		});
		throw MailErrors.invalidTrackingSignature();
	}

	const { id: emailLogId, url } = payload;

	try {
		const logEntry = await db.query.emailLog.findFirst({
			where: eq(emailLog.id, emailLogId),
		});

		if (!logEntry) {
			log.warn({
				...{ emailLogId, url },
				message: "Click tracking failed: Email log not found",
			});
			throw MailErrors.invalidTrackingSignature();
		}

		await db.insert(emailEvent).values({
			emailLogId,
			type: "clicked",
			metadata: {
				url,
			},
		});
		log.info({ ...{ emailLogId, url }, message: "Email click tracked" });
	} catch (error) {
		// Re-throw if it's already a structured error
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}

		log.error({
			...{
				error: error instanceof Error ? error.message : "Unknown error",
				emailLogId,
				url,
			},
			message: "Failed to track email click",
		});
	}

	return Response.redirect(url, 302);
}
