import { signTrackingUrl } from "@reloop/be-mail/lib/crypto";
import { MailErrors } from "@reloop/be-mail/lib/errors";
import { mailConfig } from "@reloop/be-mail/mail.config";
import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

export async function handleClickTracking({
	emailLogId,
	url,
	sig,
}: {
	emailLogId: string;
	url: string;
	sig?: string;
}) {
	if (!url) {
		throw MailErrors.invalidTrackingUrl("missing");
	}

	// Verify signature to prevent Open Redirect
	let isSignatureValid = false;
	if (sig) {
		const expectedSig = signTrackingUrl(url, mailConfig.TRACKING_SECRET);
		isSignatureValid = sig === expectedSig;
	}

	try {
		const logEntry = await db.query.emailLog.findFirst({
			where: eq(emailLog.id, emailLogId),
		});

		if (!logEntry) {
			log.warn({
				...{
					emailLogId,
					url,
				},
				message: "Click tracking failed: Email log not found",
			});
			throw MailErrors.invalidTrackingSignature();
		}

		if (!isSignatureValid) {
			// Fallback: check if the URL exists in the email HTML or plain text body.
			// In HTML, characters like '&' in URLs are often escaped as '&amp;'.
			const urlInHtml =
				logEntry.htmlBody?.includes(url) ||
				logEntry.htmlBody?.includes(url.replace(/&/g, "&amp;"));
			const urlInText = logEntry.textBody?.includes(url);

			if (!urlInHtml && !urlInText) {
				log.warn({
					...{
						emailLogId,
						url,
						sig,
					},
					message:
						"Click tracking rejected: Invalid signature and URL not found in email body",
				});
				throw MailErrors.invalidTrackingSignature();
			}
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
