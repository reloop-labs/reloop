import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { eq } from "drizzle-orm";

const TRANSPARENT_PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

export async function handleOpenTracking({
  emailLogId,
  logger,
}: {
  emailLogId: string;
  logger: Logger;
}) {
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
      logger.info({ emailLogId }, "Email open tracked");
    }
  } catch (error) {
    logger.error({ error, emailLogId }, "Failed to track email open");
  }
  return new Response(TRANSPARENT_PIXEL, { headers: { "Content-Type": "image/png", "Cache-Control": "no-cache, no-store, must-revalidate", }, });
}

export async function handleClickTracking({
  emailLogId,
  url,
  logger,
}: {
  emailLogId: string;
  url: string;
  logger: Logger;
}) {
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
      logger.info({ emailLogId, url }, "Email click tracked");
    }
  } catch (error) {
    logger.error({ error, emailLogId, url }, "Failed to track email click");
  }

  return Response.redirect(url, 302);
}
