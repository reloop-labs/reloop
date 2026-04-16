import type { MailTypes } from "@reloop/be-mail/types/mail.type.js";
import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function getAttachmentController({
  organizationId,
  emailId,
  attachmentId,
  logger,
}: {
  organizationId: string;
  emailId: string;
  attachmentId: string;
  logger: Logger;
}): Promise<MailTypes.GetAttachmentResponse> {
  try {
    // 1. Verify the email log exists and belongs to the user's organization
    const logRecord = await db.query.emailLog.findFirst({
      where: and(
        eq(emailLog.id, emailId),
        eq(emailLog.organizationId, organizationId),
      ),
      columns: {
        id: true,
      },
    });

    if (!logRecord) {
      logger.warn(
        { emailId, organizationId },
        "Email not found or not authorized for attachment retrieval",
      );
      throw status(404, { message: "Email not found" });
    }

    // 2. Mocking attachment lookup as there's no DB table for it yet.
    // In the future, query the 'emailAttachment' or 'upload' table using the attachmentId.
    logger.warn(
      { emailId, attachmentId, organizationId },
      "Attachment retrieval requested, but no persistence layer exists yet.",
    );

    throw status(404, { message: "Attachment not found" });

  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Skip redundant logging if it's our own Elysia status throw
    if (errorMessage !== "Email not found" && errorMessage !== "Attachment not found") {
      logger.error(
        { error: errorMessage, emailId, attachmentId, organizationId },
        "Failed to retrieve attachment",
      );
    }
    throw error;
  }
}
