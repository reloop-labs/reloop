import { countEmailRecipients } from "@reloop/be-mail/lib/count-recipients";
import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import { eq } from "drizzle-orm";

/** True when scheduled_at is more than ~5s in the future (avoids flapping near "now"). */
function isFutureScheduled(scheduledAt: string | undefined): string | null {
	if (!scheduledAt) return null;
	const ms = Date.parse(scheduledAt);
	if (!Number.isFinite(ms)) return null;
	if (ms <= Date.now() + 5_000) return null;
	return new Date(ms).toISOString();
}

export async function finalizeEmail_step7({
	emailLogId,
	result,
	organizationId,
	body,
}: {
	emailLogId: string;
	result: { id: string; messageId: string };
	organizationId: string;
	body: MailModel.SendEmailBody;
}) {
	await db
		.update(emailLog)
		.set({
			messageId: result.messageId || emailLogId,
			status: "sent",
			providerMessageId: result.id,
			sentAt: new Date(),
		})
		.where(eq(emailLog.id, emailLogId));

	const totalRecipients = countEmailRecipients(body);
	const timestamp = new Date().toISOString();
	const scheduledAt = isFutureScheduled(body.scheduled_at);

	if (scheduledAt) {
		await bus.publish(BusEvent.EMAIL_SCHEDULED, {
			organizationId,
			emailLogId,
			recipientCount: totalRecipients,
			scheduledAt,
			timestamp,
		});
	} else {
		await bus.publish(BusEvent.EMAIL_SENT, {
			organizationId,
			emailLogId,
			recipientCount: totalRecipients,
			timestamp,
		});
	}

	return {
		success: true,
		messageId: result.messageId || emailLogId,
		status: scheduledAt ? "scheduled" : "sent",
		timestamp,
		id: emailLogId,
	};
}
