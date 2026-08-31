import { CampaignErrors } from "@be/template/error/campaign.error";
import {
	normalizeCsvEmails,
	skipReasonForContact,
} from "@be/template/lib/campaign/audience";
import { db } from "@reloop/db/client";
import type { Campaign } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";

export type AudienceRow = {
	email: string;
	contactId: string | null;
};

async function assertGroup(organizationId: string, groupId: string) {
	const row = await db.query.group.findFirst({
		where: and(
			eq(schema.group.id, groupId),
			eq(schema.group.organizationId, organizationId),
			isNull(schema.group.deletedAt),
		),
		columns: { id: true, name: true },
	});
	if (!row) {
		throw CampaignErrors.invalidAudience(
			"Group not found in this organization.",
		);
	}
	return row;
}

async function assertChannel(organizationId: string, channelId: string) {
	const row = await db.query.channel.findFirst({
		where: and(
			eq(schema.channel.id, channelId),
			eq(schema.channel.organizationId, organizationId),
			isNull(schema.channel.deletedAt),
		),
		columns: { id: true, name: true },
	});
	if (!row) {
		throw CampaignErrors.invalidAudience(
			"Channel not found in this organization.",
		);
	}
	return row;
}

function toSendable(
	contacts: Array<{
		id: string;
		email: string;
		status: string;
		suppressionReason: string | null;
		deletedAt: Date | null;
	}>,
): AudienceRow[] {
	const rows: AudienceRow[] = [];
	const seen = new Set<string>();
	for (const contact of contacts) {
		const email = contact.email.trim().toLowerCase();
		if (!email || seen.has(email)) continue;
		if (skipReasonForContact(contact)) continue;
		seen.add(email);
		rows.push({ email, contactId: contact.id });
	}
	return rows;
}

export async function resolveSendableAudience(
	campaign: Pick<
		Campaign,
		"organizationId" | "audienceType" | "audienceTargetId" | "csvEmails"
	>,
): Promise<AudienceRow[]> {
	const organizationId = campaign.organizationId;

	if (campaign.audienceType === "csv") {
		const emails = normalizeCsvEmails(campaign.csvEmails ?? []);
		if (emails.length === 0) {
			throw CampaignErrors.invalidAudience("CSV audience has no valid emails.");
		}
		const existing = await db
			.select({
				id: schema.contact.id,
				email: schema.contact.email,
				status: schema.contact.status,
				suppressionReason: schema.contact.suppressionReason,
				deletedAt: schema.contact.deletedAt,
			})
			.from(schema.contact)
			.where(
				and(
					eq(schema.contact.organizationId, organizationId),
					inArray(schema.contact.email, emails),
					isNull(schema.contact.deletedAt),
				),
			);
		const byEmail = new Map(
			existing.map((c) => [c.email.trim().toLowerCase(), c]),
		);
		const rows: AudienceRow[] = [];
		for (const email of emails) {
			const contact = byEmail.get(email);
			if (!contact) {
				rows.push({ email, contactId: null });
				continue;
			}
			if (skipReasonForContact(contact)) continue;
			rows.push({ email, contactId: contact.id });
		}
		return rows;
	}

	if (campaign.audienceType === "group") {
		if (!campaign.audienceTargetId) {
			throw CampaignErrors.invalidAudience("A group id is required.");
		}
		await assertGroup(organizationId, campaign.audienceTargetId);
		const members = await db
			.select({
				id: schema.contact.id,
				email: schema.contact.email,
				status: schema.contact.status,
				suppressionReason: schema.contact.suppressionReason,
				deletedAt: schema.contact.deletedAt,
			})
			.from(schema.contactGroup)
			.innerJoin(
				schema.contact,
				eq(schema.contact.id, schema.contactGroup.contactId),
			)
			.where(
				and(
					eq(schema.contactGroup.groupId, campaign.audienceTargetId),
					eq(schema.contactGroup.organizationId, organizationId),
					isNull(schema.contactGroup.deletedAt),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			);
		return toSendable(members);
	}

	if (campaign.audienceType === "channel") {
		if (!campaign.audienceTargetId) {
			throw CampaignErrors.invalidAudience("A channel id is required.");
		}
		await assertChannel(organizationId, campaign.audienceTargetId);
		const members = await db
			.select({
				id: schema.contact.id,
				email: schema.contact.email,
				status: schema.contact.status,
				suppressionReason: schema.contact.suppressionReason,
				deletedAt: schema.contact.deletedAt,
			})
			.from(schema.channelSubscription)
			.innerJoin(
				schema.contact,
				eq(schema.contact.id, schema.channelSubscription.contactId),
			)
			.where(
				and(
					eq(schema.channelSubscription.channelId, campaign.audienceTargetId),
					eq(schema.channelSubscription.organizationId, organizationId),
					eq(schema.channelSubscription.status, "enrolled"),
					isNull(schema.channelSubscription.deletedAt),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			);
		return toSendable(members);
	}

	const contacts = await db
		.select({
			id: schema.contact.id,
			email: schema.contact.email,
			status: schema.contact.status,
			suppressionReason: schema.contact.suppressionReason,
			deletedAt: schema.contact.deletedAt,
		})
		.from(schema.contact)
		.where(
			and(
				eq(schema.contact.organizationId, organizationId),
				isNull(schema.contact.deletedAt),
			),
		);
	return toSendable(contacts);
}

export async function assertVerifiedFromDomain(
	organizationId: string,
	fromEmail: string,
) {
	const domainName = fromEmail.split("@")[1]?.trim().toLowerCase();
	if (!domainName) {
		throw CampaignErrors.fromRequired();
	}
	const row = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.organizationId, organizationId),
			eq(schema.domain.domain, domainName),
		),
		columns: { id: true, status: true },
	});
	if (!row || row.status === "suspended" || row.status === "failed") {
		throw CampaignErrors.unverifiedDomain(domainName);
	}
}
