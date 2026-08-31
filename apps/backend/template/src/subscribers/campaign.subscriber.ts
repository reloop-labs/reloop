import { maybeCompleteCampaign } from "@be/template/lib/campaign/dispatch";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { log } from "evlog";

const QUEUE = { queue: "campaign-stats-workers" };

async function recordOpen(emailLogId: string) {
	const [updated] = await db
		.update(schema.campaignRecipient)
		.set({ openedAt: new Date(), updatedAt: new Date() })
		.where(
			and(
				eq(schema.campaignRecipient.emailLogId, emailLogId),
				isNull(schema.campaignRecipient.openedAt),
			),
		)
		.returning({ campaignId: schema.campaignRecipient.campaignId });
	if (!updated) return;
	await db
		.update(schema.campaign)
		.set({
			openedCount: sql`${schema.campaign.openedCount} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(schema.campaign.id, updated.campaignId));
}

async function recordClick(emailLogId: string) {
	const [updated] = await db
		.update(schema.campaignRecipient)
		.set({ clickedAt: new Date(), updatedAt: new Date() })
		.where(
			and(
				eq(schema.campaignRecipient.emailLogId, emailLogId),
				isNull(schema.campaignRecipient.clickedAt),
			),
		)
		.returning({ campaignId: schema.campaignRecipient.campaignId });
	if (!updated) return;
	await db
		.update(schema.campaign)
		.set({
			clickedCount: sql`${schema.campaign.clickedCount} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(schema.campaign.id, updated.campaignId));
}

async function recordDelivery(emailLogId: string) {
	const [updated] = await db
		.update(schema.campaignRecipient)
		.set({ deliveredAt: new Date(), updatedAt: new Date() })
		.where(
			and(
				eq(schema.campaignRecipient.emailLogId, emailLogId),
				isNull(schema.campaignRecipient.deliveredAt),
			),
		)
		.returning({ campaignId: schema.campaignRecipient.campaignId });
	if (!updated) return;
	await db
		.update(schema.campaign)
		.set({
			deliveredCount: sql`${schema.campaign.deliveredCount} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(schema.campaign.id, updated.campaignId));
}

async function recordFailure(emailLogId: string, message: string) {
	const [updated] = await db
		.update(schema.campaignRecipient)
		.set({
			status: "failed",
			error: message,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(schema.campaignRecipient.emailLogId, emailLogId),
				eq(schema.campaignRecipient.status, "sent"),
			),
		)
		.returning({ campaignId: schema.campaignRecipient.campaignId });
	if (!updated) return;
	await db
		.update(schema.campaign)
		.set({
			failedCount: sql`${schema.campaign.failedCount} + 1`,
			lastError: message,
			updatedAt: new Date(),
		})
		.where(eq(schema.campaign.id, updated.campaignId));
	await maybeCompleteCampaign(updated.campaignId);
}

export async function initCampaignSubscribers(): Promise<void> {
	await bus.subscribe(
		BusEvent.EMAIL_OPENED,
		async (payload) => {
			await recordOpen(payload.emailLogId);
		},
		QUEUE,
	);
	await bus.subscribe(
		BusEvent.EMAIL_CLICKED,
		async (payload) => {
			await recordClick(payload.emailLogId);
		},
		QUEUE,
	);
	await bus.subscribe(
		BusEvent.EMAIL_FAILED,
		async (payload) => {
			await recordFailure(payload.emailLogId, payload.errorMessage);
		},
		QUEUE,
	);
	await bus.subscribe(
		BusEvent.KUMOMTA_EVENT,
		async (event) => {
			const emailLogId =
				event.headers?.["X-Email-Log-ID"] || event.meta?.["X-Email-Log-ID"];
			if (!emailLogId) return;
			if (event.type === "Delivery") {
				await recordDelivery(emailLogId);
			}
			if (
				event.type === "Bounce" ||
				event.type === "AdminBounce" ||
				event.type === "OOB" ||
				event.type === "Expiration"
			) {
				await recordFailure(emailLogId, event.type);
			}
		},
		QUEUE,
	);

	log.info("subscriber", "Campaign stats subscribers initialized");
}
