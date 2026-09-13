import { BusEvent, bus } from "@reloop/bus";
import { emailConfig } from "@reloop/email/email.config";
import ExportReadyEmail from "@reloop/email/emails/export-ready";
import { redis } from "@reloop/email/lib/redis";
import { render, toPlainText } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { requireReloopSenderDomain } from "@reloop/email/utils/sender-domain";
import { log } from "evlog";
import React from "react";

export async function initExportSubscribers() {
	await bus.subscribe(
		BusEvent.CONTACT_EXPORT_READY,
		async (payload) => {
			const dedupKey = `email:export-ready:${payload.exportId}`;
			try {
				const alreadySent = await redis.get(dedupKey);
				if (alreadySent) {
					log.warn(
						"server",
						`Duplicate CONTACT_EXPORT_READY for ${payload.exportId}, skipping`,
					);
					return;
				}
				const html = await render(
					React.createElement(ExportReadyEmail, {
						totalRows: payload.totalRows,
						fileName: payload.fileName,
						downloadUrl: payload.downloadUrl,
						expiresAt: payload.expiresAt,
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard/contacts`,
						baseUrl: emailConfig.BASE_URL,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `Reloop <exports@${requireReloopSenderDomain()}>`,
					to: payload.to,
					subject: `Your contacts export is ready (${payload.totalRows.toLocaleString()} rows)`,
					html,
					text,
				});

				await redis.set(dedupKey, "1", 7 * 24 * 60 * 60);
			} catch (error) {
				await redis.delete(dedupKey).catch(() => {});
				log.error({
					...{ error, payload },
					message: "Failed to send export-ready email",
				});
			}
		},
		{ queue: "export-email-worker" },
	);
}
