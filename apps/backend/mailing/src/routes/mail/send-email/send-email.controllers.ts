import { kumomtaClient } from "@reloop/be-mailing/lib/kumomta-client";
import type { MailTypes } from "@reloop/be-mailing/types/mail.type.js";
import { db } from "@reloop/db/client";
import {
  type dnsRecordTypeNameEnum,
  domain,
  domainDnsRecord,
  emailLog,
} from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { bus, BusEvent } from "@reloop/bus";

export async function sendEmailController({
  organizationId,
  body,
  logger,
}: {
  organizationId: string;
  body: MailTypes.SendEmailRequest;
  logger: Logger;
}): Promise<MailTypes.SendEmailHandlerResponse> {
  const timestamp = new Date().toISOString();

  try {
    logger.info(
      {
        from: body.from,
        to: body.to,
        organizationId,
      },
      "Sending email",
    );

    // Validate sender email belongs to user's organization
    const fromParts = body.from.split("@");
    if (fromParts.length < 2) {
      throw new Error("Invalid 'from' email address format");
    }
    const domainName = fromParts[1];
    if (!domainName) {
      throw new Error("Invalid 'from' email address format");
    }

    const domainRecord = await db
      .select()
      .from(domain)
      .where(
        and(
          eq(domain.organizationId, organizationId),
          or(
            eq(domain.domain, domainName),
            sql`${domainName} LIKE ('%.' || ${domain.domain})`,
          ),
        ),
      )
      .limit(1);

    if (domainRecord.length === 0) {
      throw new Error(`Domain ${domainName} not found or not authorized`);
    }

    const currentDomain = domainRecord[0];
    if (!currentDomain) {
      throw new Error(`Domain ${domainName} not found or not authorized`);
    }

    // DNS Health Check: Verify domain has valid DNS records before sending
    const dnsHealthCheck = await checkDomainDnsHealth(
      currentDomain.id,
      organizationId,
      logger,
    );

    if (!dnsHealthCheck.isHealthy) {
      const errorMessage = `Domain ${domainName} has invalid or missing DNS records: ${dnsHealthCheck.missingRecords.join(", ")}. Please verify your DNS records are configured correctly.`;
      throw new Error(errorMessage);
    }

    const [logRecord] = await db
      .insert(emailLog)
      .values({
        messageId: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        organizationId,
        domainId: currentDomain.id,
        fromEmail: body.from,
        fromName: body.from.split("@")[0],
        toEmails: Array.isArray(body.to) ? body.to : [body.to],
        ccEmails: body.cc
          ? Array.isArray(body.cc)
            ? body.cc
            : [body.cc]
          : undefined,
        bccEmails: body.bcc
          ? Array.isArray(body.bcc)
            ? body.bcc
            : [body.bcc]
          : undefined,
        replyTo: Array.isArray(body.replyTo) ? body.replyTo.join(", ") : body.replyTo,
        subject: body.subject,
        textBody: body.text,
        htmlBody: body.html,
        status: "pending",
        provider: "kumomta",
        size: (body.text?.length || 0) + (body.html?.length || 0),
      })
      .returning({ id: emailLog.id });

    const emailLogId = logRecord?.id;
    if (!emailLogId) {
      throw new Error("Failed to create email log record");
    }

    // Template Resolution: If template is provided, fetch and substitute variables
    let finalSubject = body.subject;
    let finalHtml = body.html;
    let finalText = body.text;

    if (body.template?.id) {
      const templateId = body.template.id;
      const templateRecord = await db.query.template.findFirst({
        where: (t, { and: dbAnd, eq: dbEq, isNull: dbIsNull }) =>
          dbAnd(
            dbEq(t.id, templateId),
            dbEq(t.organizationId, organizationId),
            dbIsNull(t.deletedAt),
          ),
      });

      if (!templateRecord) {
        throw new Error(`Template ${body.template.id} not found`);
      }

      // Latest version for rendered HTML
      const latestVersion = await db.query.templateVersion.findFirst({
        where: (tv, { eq: dbEq }) => dbEq(tv.templateId, templateRecord.id),
        orderBy: (tv, { desc: dbDesc }) => [dbDesc(tv.version)],
      });

      finalSubject = templateRecord.subject || finalSubject;
      finalHtml = latestVersion?.renderedHtml || finalHtml;

      const variables = body.template.variables;
      if (variables) {
        const substitute = (str: string) => {
          let substituted = str;
          for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            substituted = substituted.replace(regex, String(value));
          }
          return substituted;
        };

        if (finalSubject) finalSubject = substitute(finalSubject);
        if (finalHtml) finalHtml = substitute(finalHtml);
        if (finalText) finalText = substitute(finalText);
      }
    }

    // Send email via KumoMTA HTTP injection API with tracking headers
    const result = await kumomtaClient.sendEmail({
      from: body.from,
      to: body.to,
      subject: finalSubject,
      text: finalText,
      html: finalHtml,
      replyTo: body.replyTo,
      cc: body.cc,
      bcc: body.bcc,
      scheduledAt: body.scheduledAt,
      channelId: body.channelId,
      attachments: body.attachments,
      tags: body.tags,
      template: body.template,
      customHeaders: {
        "X-Org-ID": organizationId,
        "X-Domain-ID": currentDomain.id,
        "X-Email-Log-ID": emailLogId,
        ...(body.headers || {}),
      },
    });

    // Update emailLog to "sent" with the real message ID from KumoMTA
    await db
      .update(emailLog)
      .set({
        messageId: result.messageId || emailLogId,
        status: "sent",
        providerMessageId: result.id,
        sentAt: new Date(),
      })
      .where(eq(emailLog.id, emailLogId));

    logger.info(
      {
        emailLogId,
        messageId: result.messageId,
        from: body.from,
        to: body.to,
        organizationId,
      },
      "Email sent and logged successfully",
    );

    // Track credits
    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    const cc = body.cc ? (Array.isArray(body.cc) ? body.cc : [body.cc]) : [];
    const bcc = body.bcc ? (Array.isArray(body.bcc) ? body.bcc : [body.bcc]) : [];
    const totalRecipients = recipients.length + cc.length + bcc.length;

    await bus.publish(BusEvent.EMAIL_SENT, {
      organizationId,
      emailLogId,
      recipientCount: totalRecipients,
      timestamp,
    });

    return {
      success: true,
      messageId: result.messageId || emailLogId,
      status: "sent",
      timestamp,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(
      {
        error: errorMessage,
        from: body.from,
        to: body.to,
        organizationId,
      },
      "Failed to send email",
    );

    throw error;
  }
}

/**
 * Checks if domain has valid DNS records configured for email sending
 * Returns lightweight check using cached domain status first, then DNS records table
 */
async function checkDomainDnsHealth(
  domainId: string,
  organizationId: string,
  logger: Logger,
): Promise<{
  isHealthy: boolean;
  missingRecords: string[];
}> {
  // Quick check using cached domain status
  const domainData = await db.query.domain.findFirst({
    where: and(
      eq(domain.id, domainId),
      eq(domain.organizationId, organizationId),
    ),
    columns: {
      id: true,
      domain: true,
      systemVerified: true,
      status: true,
      lastVerifiedAt: true,
    },
  });

  if (!domainData) {
    return {
      isHealthy: false,
      missingRecords: ["Domain not found"],
    };
  }

  // If domain status indicates DNS is configured and verified, and recently checked, skip detailed check
  const STALE_THRESHOLD_HOURS = 6;
  const lastVerified = domainData.lastVerifiedAt;
  const isRecent = lastVerified
    ? Date.now() - new Date(lastVerified).getTime() <
    STALE_THRESHOLD_HOURS * 60 * 60 * 1000
    : false;

  if (domainData.systemVerified && domainData.status === "active" && isRecent) {
    return {
      isHealthy: true,
      missingRecords: [],
    };
  }

  // Perform detailed check on DNS records table if cached status is uncertain
  const requiredRecordTypes = ["SPF", "DKIM", "DMARC"];
  const dnsRecords = await db
    .select({
      recordTypeName: domainDnsRecord.recordTypeName,
      status: domainDnsRecord.status,
    })
    .from(domainDnsRecord)
    .where(
      and(
        eq(domainDnsRecord.domainId, domainId),
        eq(domainDnsRecord.organizationId, organizationId),
        inArray(
          domainDnsRecord.recordTypeName,
          requiredRecordTypes as (typeof dnsRecordTypeNameEnum.enumValues)[number][],
        ),
      ),
    )
    .limit(10);

  const foundRecordTypes = new Set(
    dnsRecords
      .filter((r) => r.status === "active")
      .map((r) => r.recordTypeName),
  );

  const missingRecords = requiredRecordTypes.filter(
    (type) =>
      !foundRecordTypes.has(
        type as (typeof dnsRecordTypeNameEnum.enumValues)[number],
      ),
  );

  const isHealthy = missingRecords.length === 0;

  if (!isHealthy) {
    logger.warn(
      {
        domainId,
        missingRecords,
        foundRecords: Array.from(foundRecordTypes),
      },
      "Domain DNS health check failed",
    );
  }

  return {
    isHealthy,
    missingRecords,
  };
}
