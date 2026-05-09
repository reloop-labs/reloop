import { signTrackingUrl } from "@reloop/be-mailing/lib/crypto";
import { MailErrors } from "@reloop/be-mailing/lib/errors";
import { mailConfig } from "@reloop/be-mailing/mail.config";
import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function handleClickTracking({
	emailLogId,
	url,
	sig,
}: {
	emailLogId: string;
	url: string;
	sig: string;
}) {
	const logger = useLogger();

	if (!url) {
		throw MailErrors.invalidTrackingUrl("missing");
	}

	// Verify signature to prevent Open Redirect
	const expectedSig = signTrackingUrl(url, mailConfig.TRACKING_SECRET);
	if (sig !== expectedSig) {
		logger.warn("Click tracking rejected: Invalid signature", {
			emailLogId,
			url,
			sig,
			expectedSig,
		});
		throw MailErrors.invalidTrackingSignature();
	}

	try {
		const logEntry = await db.query.emailLog.findFirst({
			where: eq(emailLog.id, emailLogId),
		});

		if (logEntry) {
			await db.insert(emailEvent).values({
				emailLogId,
				type: "clicked",
				metadata: {
					url,
				},
			});
			logger.info("Email click tracked", { emailLogId, url });
		} else {
			logger.warn("Click tracking failed: Email log not found", {
				emailLogId,
				url,
			});
		}
	} catch (error) {
		// Re-throw if it's already a structured error
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}

		logger.error("Failed to track email click", {
			error: error instanceof Error ? error.message : "Unknown error",
			emailLogId,
			url,
		});
	}

	return Response.redirect(url, 302);
}
