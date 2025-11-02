import { createId } from "@paralleldrive/cuid2";
import { postfixClient } from "@reloop/be-mail/lib/postfix-client";
import type { MailTypes } from "@reloop/be-mail/routes/mail/mail.type.js";
import { db } from "@reloop/db/client";
import { domain, emailLog } from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, or, sql } from "drizzle-orm";

export async function sendEmail(
    emailData: MailTypes.SendEmailRequest,
    organizationId: string,
): Promise<MailTypes.SendEmailHandlerResponse> {
    const messageId = createId();
    const timestamp = new Date().toISOString();

    try {
        // Validate sender email belongs to user's organization
        const domainName = emailData.from.split("@")[1];
        if (!domainName) {
            throw new Error("Invalid 'from' email address");
        }
        const domainRecord = await db
            .select()
            .from(domain)
            .where(
                and(
                    eq(domain.organizationId, organizationId),
                    or(
                        eq(domain.domain, domainName),
                        sql`${domainName} LIKE ('%.' || ${domain.domain})`
                    )
                )
            )
            .limit(1);

        if (domainRecord.length === 0) {
            throw new Error(`Domain ${domainName} not found or not authorized`);
        }

        // Check if user has a mailbox for this domain


        // Send email via Postfix
        const result = await postfixClient.sendEmail({
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
            replyTo: emailData.replyTo,
            cc: emailData.cc,
            bcc: emailData.bcc,
        });

        // Log email in database
        await db.insert(emailLog).values({
            messageId: result.messageId,
            organizationId,
            domainId: domainRecord[0]?.id || "",
            fromEmail: emailData.from,
            fromName: emailData.from.split("@")[0],
            toEmails: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
            ccEmails: emailData.cc
                ? Array.isArray(emailData.cc)
                    ? emailData.cc
                    : [emailData.cc]
                : undefined,
            bccEmails: emailData.bcc
                ? Array.isArray(emailData.bcc)
                    ? emailData.bcc
                    : [emailData.bcc]
                : undefined,
            replyTo: emailData.replyTo,
            subject: emailData.subject,
            textBody: emailData.text,
            htmlBody: emailData.html,
            status: "sent",
            provider: "postfix",
            providerMessageId: result.messageId,
            size: (emailData.text?.length || 0) + (emailData.html?.length || 0),
            sentAt: new Date(),
        });

        logger.info(
            {
                messageId: result.messageId,
                from: emailData.from,
                to: emailData.to,
                organizationId,
            },
            "Email sent and logged successfully",
        );

        return {
            success: true,
            messageId: result.messageId,
            status: "sent",
            timestamp,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        await db.insert(emailLog).values({
            messageId,
            organizationId,
            domainId: "",
            fromEmail: emailData.from,
            toEmails: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
            subject: emailData.subject,
            textBody: emailData.text,
            htmlBody: emailData.html,
            status: "failed",
            errorMessage,
            provider: "postfix",
            size: (emailData.text?.length || 0) + (emailData.html?.length || 0),
            failedAt: new Date(),
        });

        logger.error(
            {
                error: errorMessage,
                from: emailData.from,
                to: emailData.to,
                organizationId,
            },
            "Failed to send email",
        );

        throw error;
    }
}

export async function sendEmailHandler(
    organizationId: string,
    body: MailTypes.SendEmailRequest,
): Promise<MailTypes.SendEmailHandlerResponse> {
    logger.info(
        {
            from: body.from,
            to: body.to,
            organizationId,
        },
        "Sending email",
    );

    try {
        const result = await sendEmail(body, organizationId);
        logger.info(
            {
                from: body.from,
                to: body.to,
                organizationId,
            },
            "Email sent successfully",
        );

        return result;
    } catch (error) {
        logger.error(
            {
                from: body.from,
                to: body.to,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error sending email",
        );
        throw error;
    }
}
