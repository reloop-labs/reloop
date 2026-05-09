import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import { useLogger } from "evlog/elysia";
import { eq } from "drizzle-orm";

const TRANSPARENT_PIXEL = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
	"base64",
);

export async function handleOpenTracking({
	emailLogId,
}: {
	emailLogId: string;
}) {
	const logger = useLogger();
	try {
		const logEntry = await db.query.emailLog.findFirst({
			where: eq(emailLog.id, emailLogId),
		});
		if (logEntry) {
			await db.insert(emailEvent).values({
				emailLogId,
				type: "opened",
				metadata: {
					userAgent: "unknown", // Could be extracted from headers if needed
				},
			});
			logger.info("Email open tracked", { emailLogId });
		}
	} catch (error) {
		logger.error("Failed to track email open", { error, emailLogId });
	}
	return new Response(TRANSPARENT_PIXEL, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "no-cache, no-store, must-revalidate",
		},
	});
}

export async function handleClickTracking({
	emailLogId,
	url,
}: {
	emailLogId: string;
	url: string;
}) {
	const logger = useLogger();
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
		}
	} catch (error) {
		logger.error("Failed to track email click", { error, emailLogId, url });
	}

	return Response.redirect(url, 302);
}
