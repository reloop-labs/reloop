import { db } from "@reloop/db/client";
import { domain, emailLog } from "@reloop/db/schema";
import logger from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { verifyApiKeyController } from "../verify/verify.controllers";

interface LogIncomingInput {
  key: string;
  domainName: string;
  messageId: string;
  providerMessageId?: string;
  fromEmail: string;
  toEmails: string[];
  subject: string;
  textBody?: string;
  htmlBody?: string;
  size: number;
}

export async function logIncomingController(
  input: LogIncomingInput,
): Promise<{ id?: string; error?: string; code?: number }> {
  try {
    const apiKeyResult = await verifyApiKeyController(input.key);
    if (!apiKeyResult) return { error: "Invalid API Key", code: 401 };

    const domainRecord = await db.query.domain.findFirst({
      where: and(
        eq(domain.domain, input.domainName),
        eq(domain.organizationId, apiKeyResult.organizationId),
        isNull(domain.deletedAt),
      ),
      columns: { id: true, status: true },
    });

    if (!domainRecord || domainRecord.status !== "active") {
      return { error: "Domain not verified", code: 404 };
    }

    const inserted = await db
      .insert(emailLog)
      .values({
        messageId:
          input.messageId ||
          `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        organizationId: apiKeyResult.organizationId,
        domainId: domainRecord.id,
        fromEmail: input.fromEmail,
        toEmails: input.toEmails,
        subject: input.subject || "No Subject",
        textBody: input.textBody || "",
        htmlBody: input.htmlBody || "",
        status: "pending",
        size: input.size || 0,
        provider: "kumomta",
        providerMessageId: input.providerMessageId,
      })
      .returning({ id: emailLog.id });

    if (!inserted || inserted.length === 0)
      return { error: "Failed to insert email log", code: 400 };
    return { id: inserted[0]!.id, code: 200 };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        domain: input.domainName,
      },
      "Error logging incoming email",
    );
    return { error: "Internal Error", code: 500 };
  }
}
