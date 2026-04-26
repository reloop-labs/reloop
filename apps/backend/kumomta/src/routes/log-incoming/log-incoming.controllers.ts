import { db } from "@reloop/db/client";
import { domain, emailLog } from "@reloop/db/schema";
import logger from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { simpleParser } from "mailparser";
import { kumomtaConfig } from "../../kumomta.config";
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
  rawMessage?: string;
  size: number;
}

export async function logIncomingController(
  input: LogIncomingInput,
): Promise<{ id?: string; error?: string; code?: number }> {
  try {
    let organizationId: string | undefined;

    if (input.key === kumomtaConfig.X_KUMOMTA_KEY) {
      organizationId = undefined;
    } else {
      const apiKeyResult = await verifyApiKeyController(input.key);
      if (!apiKeyResult) return { error: "Invalid API Key", code: 401 };
      organizationId = apiKeyResult.organizationId;
    }

    // Parse raw message if provided
    let textBody = input.textBody || "";
    let htmlBody = input.htmlBody || "";
    let subject = input.subject || "No Subject";

    if (input.rawMessage) {
      console.log(`[LOG-INCOMING] Parsing rawMessage (length: ${input.rawMessage.length})`);
      try {
        const parsed = await simpleParser(input.rawMessage);
        console.log(`[LOG-INCOMING] Parsed: text=${!!parsed.text}, html=${!!parsed.html}`);
        // Reset bodies to ensure we only use the high-fidelity parsed content
        textBody = parsed.text || "";
        htmlBody = (parsed.html as string) || "";
        subject = parsed.subject || subject;
      } catch (parseError) {
        console.error("[LOG-INCOMING] mailparser error:", parseError);
        logger.error({ parseError }, "Error parsing raw message in log-incoming");
      }
    }

    const domainQuery = organizationId
      ? and(
        eq(domain.domain, input.domainName),
        eq(domain.organizationId, organizationId),
        isNull(domain.deletedAt),
      )
      : and(
        eq(domain.domain, input.domainName),
        isNull(domain.deletedAt),
      );

    const domainRecord = await db.query.domain.findFirst({
      where: domainQuery,
      columns: { id: true, status: true, organizationId: true },
    });

    if (!domainRecord || domainRecord.status !== "active") {
      return { error: "Domain not verified", code: 404 };
    }

    // Use the domain's organizationId if we bypassed standard auth (master key)
    const finalOrgId = organizationId || domainRecord.organizationId;

    const inserted = await db
      .insert(emailLog)
      .values({
        messageId:
          input.messageId ||
          `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        organizationId: finalOrgId,
        domainId: domainRecord.id,
        fromEmail: input.fromEmail,
        toEmails: input.toEmails,
        subject: subject,
        textBody: textBody,
        htmlBody: htmlBody,
        status: "pending",
        size: input.size || 0,
        provider: "kumomta",
        providerMessageId: input.providerMessageId,
      })
      .returning({ id: emailLog.id });

    if (!inserted || inserted.length === 0)
      return { error: "Failed to insert email log", code: 400 };
    return { id: inserted[0]?.id, code: 200 };
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
