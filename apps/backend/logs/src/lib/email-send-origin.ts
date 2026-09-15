import {
	type EmailLogTag,
	type EmailSendSource,
	isEmailSendSource,
	sourceFromTags,
	tagValue,
} from "@reloop/db";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";

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
