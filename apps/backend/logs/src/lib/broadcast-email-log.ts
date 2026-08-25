import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { deriveDisplayStatus } from "@reloop/logs/lib/email-log-display-status";
import { broadcastToOrg } from "@reloop/logs/rooms/logs.rooms";
import { eq } from "drizzle-orm";
import { log } from "evlog";

export type EmailLogLivePayload = {
	id: string;
	subject: string;
	fromEmail: string;
	toEmails: string[];
	status: string;
	createdAt: string;
	hasAttachments: boolean;
};

export function emailLogLiveEvent(data: EmailLogLivePayload) {
	return {
		type: "email_log_updated" as const,
		data,
	};
}

export async function broadcastEmailLogLive(emailLogId: string): Promise<void> {
	try {
		const row = await db.query.emailLog.findFirst({
			where: eq(schema.emailLog.id, emailLogId),
			columns: {
				id: true,
				organizationId: true,
				subject: true,
				fromEmail: true,
				toEmails: true,
				status: true,
				createdAt: true,
				attachments: true,
			},
			with: {
				events: {
					columns: { type: true },
				},
			},
		});

		if (!row?.organizationId) return;

		broadcastToOrg(
			row.organizationId,
			emailLogLiveEvent({
				id: row.id,
				subject: row.subject,
				fromEmail: row.fromEmail,
				toEmails: (row.toEmails ?? []) as string[],
				status: deriveDisplayStatus(
					row.status,
					(row.events ?? []).map((event) => event.type),
				),
				createdAt: row.createdAt.toISOString(),
				hasAttachments: Array.isArray(row.attachments)
					? row.attachments.length > 0
					: false,
			}),
		);
	} catch (error) {
		log.warn({
			message: "Failed to broadcast email log live update",
			emailLogId,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
