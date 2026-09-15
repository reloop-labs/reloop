import {
	type EmailLogTag,
	type EmailSendSource,
	isEmailSendSource,
	sourceFromTags,
	tagValue,
} from "@reloop/db";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq, inArray } from "drizzle-orm";

export type EmailSendOrigin = {
	type: "campaign" | "automation";
	id: string;
	name: string;
};

export type ResolvedEmailSend = {
	source: EmailSendSource;
	origin: EmailSendOrigin | null;
};

export async function resolveEmailSend(params: {
	emailLogId: string;
	storedSource?: string | null;
	tags?: EmailLogTag[] | null;
}): Promise<ResolvedEmailSend> {
	const tags = params.tags ?? [];
	let source: EmailSendSource = isEmailSendSource(params.storedSource)
		? params.storedSource
		: sourceFromTags(tags);

	const campaignId = tagValue(tags, "campaign");
	const automationId = tagValue(tags, "automation");

	let origin: EmailSendOrigin | null = null;

	if (source !== "smtp") {
		const campaign = await findCampaignOrigin({
			emailLogId: params.emailLogId,
			campaignId,
		});
		if (campaign) {
			source = "campaign";
			origin = campaign;
			return { source, origin };
		}

		const automation = await findAutomationOrigin({
			emailLogId: params.emailLogId,
			automationId,
		});
		if (automation) {
			source = "automation";
			origin = automation;
			return { source, origin };
		}
	}

	return { source, origin };
}

export async function resolveEmailSends(
	logs: Array<{
		id: string;
		source?: string | null;
		tags?: EmailLogTag[] | null;
	}>,
): Promise<Map<string, ResolvedEmailSend>> {
	const resolved = new Map<string, ResolvedEmailSend>();
	if (logs.length === 0) return resolved;

	const ids = logs.map((log) => log.id);
	const [campaignRows, automationRows] = await Promise.all([
		db
			.select({
				emailLogId: schema.campaignRecipient.emailLogId,
				id: schema.campaign.id,
				name: schema.campaign.name,
			})
			.from(schema.campaignRecipient)
			.innerJoin(
				schema.campaign,
				eq(schema.campaign.id, schema.campaignRecipient.campaignId),
			)
			.where(inArray(schema.campaignRecipient.emailLogId, ids)),
		db
			.select({
				emailLogId: schema.automationStepRun.emailLogId,
				id: schema.automation.id,
				name: schema.automation.name,
			})
			.from(schema.automationStepRun)
			.innerJoin(
				schema.automationEnrollment,
				eq(
					schema.automationEnrollment.id,
					schema.automationStepRun.enrollmentId,
				),
			)
			.innerJoin(
				schema.automation,
				eq(schema.automation.id, schema.automationEnrollment.automationId),
			)
			.where(inArray(schema.automationStepRun.emailLogId, ids)),
	]);

	const campaignByLog = new Map<string, EmailSendOrigin>();
	for (const row of campaignRows) {
		if (!row.emailLogId) continue;
		campaignByLog.set(row.emailLogId, {
			type: "campaign",
			id: row.id,
			name: row.name,
		});
	}

	const automationByLog = new Map<string, EmailSendOrigin>();
	for (const row of automationRows) {
		if (!row.emailLogId) continue;
		automationByLog.set(row.emailLogId, {
			type: "automation",
			id: row.id,
			name: row.name,
		});
	}

	for (const log of logs) {
		const tags = log.tags ?? [];
		const source: EmailSendSource = isEmailSendSource(log.source)
			? log.source
			: sourceFromTags(tags);

		if (source !== "smtp" && campaignByLog.has(log.id)) {
			resolved.set(log.id, {
				source: "campaign",
				origin: campaignByLog.get(log.id) ?? null,
			});
			continue;
		}
		if (source !== "smtp" && automationByLog.has(log.id)) {
			resolved.set(log.id, {
				source: "automation",
				origin: automationByLog.get(log.id) ?? null,
			});
			continue;
		}

		resolved.set(log.id, { source, origin: null });
	}

	return resolved;
}

async function findCampaignOrigin(params: {
	emailLogId: string;
	campaignId?: string;
}): Promise<EmailSendOrigin | null> {
	let campaignId = params.campaignId;
	if (!campaignId) {
		const recipient = await db.query.campaignRecipient.findFirst({
			where: eq(schema.campaignRecipient.emailLogId, params.emailLogId),
			columns: { campaignId: true },
		});
		campaignId = recipient?.campaignId;
	}
	if (!campaignId) return null;

	const campaign = await db.query.campaign.findFirst({
		where: eq(schema.campaign.id, campaignId),
		columns: { id: true, name: true },
	});
	if (!campaign) return null;
	return { type: "campaign", id: campaign.id, name: campaign.name };
}

async function findAutomationOrigin(params: {
	emailLogId: string;
	automationId?: string;
}): Promise<EmailSendOrigin | null> {
	let automationId = params.automationId;
	if (!automationId) {
		const step = await db.query.automationStepRun.findFirst({
			where: eq(schema.automationStepRun.emailLogId, params.emailLogId),
			columns: { enrollmentId: true },
		});
		if (step) {
			const enrollment = await db.query.automationEnrollment.findFirst({
				where: eq(schema.automationEnrollment.id, step.enrollmentId),
				columns: { automationId: true },
			});
			automationId = enrollment?.automationId;
		}
	}
	if (!automationId) return null;

	const automation = await db.query.automation.findFirst({
		where: eq(schema.automation.id, automationId),
		columns: { id: true, name: true },
	});
	if (!automation) return null;
	return { type: "automation", id: automation.id, name: automation.name };
}
