import {
	decodeTrackingToken,
	type OpenTrackingPayload,
} from "@reloop/be-mail/lib/crypto";
import { mailConfig } from "@reloop/be-mail/mail.config";
import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

const TRANSPARENT_PIXEL = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
	"base64",
);

export async function handleOpenTracking({ token }: { token: string }) {
	const payload = decodeTrackingToken<OpenTrackingPayload>(
		token,
		mailConfig.TRACKING_SECRET,
	);

	if (!payload) {
		log.warn({
			...{ token },
			message: "Open tracking rejected: Invalid or tampered token",
		});
		return new Response(TRANSPARENT_PIXEL, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
	}

	const { id: emailLogId } = payload;

	try {
		const logEntry = await db.query.emailLog.findFirst({
			where: eq(emailLog.id, emailLogId),
		});

		if (logEntry) {
			await db.insert(emailEvent).values({
				emailLogId,
				type: "opened",
				metadata: {
					userAgent: "unknown",
				},
			});
			log.info({ ...{ emailLogId }, message: "Email open tracked" });
		} else {
			log.warn({
				...{ emailLogId },
				message: "Open tracking failed: Email log not found",
			});
		}
	} catch (error) {
		log.error({
			...{
				error: error instanceof Error ? error.message : "Unknown error",
				emailLogId,
			},
			message: "Failed to track email open",
		});
	}

	return new Response(TRANSPARENT_PIXEL, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "no-cache, no-store, must-revalidate",
		},
	});
}
