import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { domain, emailLog } from "@reloop/db/schema";
import { KumoMtaErrors } from "@reloop/domain/error/domain.error-response";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { simpleParser } from "mailparser";

export type LogIncomingParams = {
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
};

export async function logIncomingController({
	body,
	organizationId,
}: {
	body: LogIncomingParams;
	organizationId: string;
}): Promise<{ id: string }> {
	const log = useLogger();
	let textBody = body.textBody || "";
	let htmlBody = body.htmlBody || "";
	let subject = body.subject || "No Subject";

	if (body.rawMessage) {
		log.info(
			`[LOG-INCOMING] Parsing rawMessage (length: ${body.rawMessage.length})`,
		);
		try {
			const parsed = await simpleParser(body.rawMessage);
			log.info(
				`[LOG-INCOMING] Parsed rawMessage (text: ${!!parsed.text}, html: ${!!parsed.html})`,
			);
			textBody = parsed.text || "";
			htmlBody = (parsed.html as string) || "";
			subject = parsed.subject || subject;
		} catch (parseError) {
			log.error(
				`[LOG-INCOMING] mailparser error: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
			);
		}
	}

	const domainQuery = and(
		eq(domain.domain, body.domainName),
		eq(domain.organizationId, organizationId),
		isNull(domain.deletedAt),
	);

	log.info(
		`[LOG-INCOMING] Querying domain: ${body.domainName} (Org: ${organizationId})`,
	);

	const domainRecord = await db.query.domain.findFirst({
		where: domainQuery,
		columns: { id: true, status: true, organizationId: true },
	});

	if (!domainRecord) {
		log.warn(
			`[LOG-INCOMING] Domain NOT FOUND: ${body.domainName} (Org: ${organizationId})`,
		);
		throw KumoMtaErrors.domainNotFound(body.domainName);
	}

	if (domainRecord.status !== "active") {
		log.warn(
			`[LOG-INCOMING] Domain found but NOT ACTIVE: ${body.domainName} (Status: ${domainRecord.status})`,
		);
		throw KumoMtaErrors.domainNotActive(body.domainName);
	}

	const finalOrgId = organizationId || domainRecord.organizationId;

	const existingLog = await db.query.emailLog.findFirst({
		where: eq(emailLog.messageId, body.messageId),
		columns: { id: true },
	});

	if (existingLog) {
		log.info(`[LOG-INCOMING] Message ID already exists: ${body.messageId}`);
		throw KumoMtaErrors.messageIdConflict(body.messageId);
	}

	const inserted = await db
		.insert(emailLog)
		.values({
			messageId:
				body.messageId ||
				`msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			organizationId: finalOrgId,
			domainId: domainRecord.id,
			fromEmail: body.fromEmail,
			toEmails: body.toEmails,
			subject: subject,
			textBody: textBody,
			htmlBody: htmlBody,
			status: "pending",
			size: body.size || 0,
			provider: "kumomta",
			providerMessageId: body.providerMessageId,
		})
		.returning({ id: emailLog.id });

	const insertedId = inserted?.[0]?.id;
	if (!insertedId) {
		throw KumoMtaErrors.failedToInsertLog();
	}

	await bus.publish(BusEvent.EMAIL_SENT, {
		organizationId: finalOrgId,
		emailLogId: insertedId,
		recipientCount: body.toEmails.length,
		timestamp: new Date().toISOString(),
	});

	return { id: insertedId };
}
