import { signTrackingUrl } from "@reloop/be-mailing/lib/crypto";
import { mailConfig } from "@reloop/be-mailing/mail.config";
import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

const TRANSPARENT_PIXEL = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
	"base64",
);

export async function handleOpenTracking({
	emailLogId,
	sig,
}: {
	emailLogId: string;
	sig: string;
}) {
	const logger = useLogger();
	const expectedSig = signTrackingUrl(emailLogId, mailConfig.TRACKING_SECRET);
	if (sig !== expectedSig) {
		logger.warn("Open tracking rejected: Invalid signature", {
			emailLogId,
			sig,
			expectedSig,
		});
		return new Response(TRANSPARENT_PIXEL, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
	}

	try {
		const logEntry = await db.query.emailLog.findFirst({ where: eq(emailLog.id, emailLogId), });

		if (logEntry) {
			await db.insert(emailEvent).values({
				emailLogId,
				type: "opened",
				metadata: {
					userAgent: "unknown",
				},
			});
			logger.info("Email open tracked", { emailLogId });
		} else {
			logger.warn("Open tracking failed: Email log not found", { emailLogId });
		}
	} catch (error) {
		logger.error("Failed to track email open", {
			error: error instanceof Error ? error.message : "Unknown error",
			emailLogId,
		});
	}

	return new Response(TRANSPARENT_PIXEL, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "no-cache, no-store, must-revalidate",
		},
	});
}
