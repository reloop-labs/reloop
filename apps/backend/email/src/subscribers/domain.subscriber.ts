import type { DnsConfigRequestedPayload } from "@reloop/bus";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import DnsConfigEmail from "@reloop/email/emails/dns-config";
import DomainVerifiedEmail from "@reloop/email/emails/domain-verified";
import { render, toPlainText } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { requireReloopSenderDomain } from "@reloop/email/utils/sender-domain";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";
import React from "react";

type DnsConfigRecord = DnsConfigRequestedPayload["records"][number];

type EmailDnsRecord = {
	recordType: string;
	recordTypeName: string;
	name: string;
	value: string;
	ttl: string;
	priority: number | null;
};

function toEmailRecord(r: DnsConfigRecord): EmailDnsRecord {
	return {
		recordType: r.type,
		recordTypeName: r.recordTypeName ?? r.type,
		name: r.name,
		value: r.value,
		ttl: r.ttl ?? "Auto",
		priority: r.priority ?? null,
	};
}

/**
 * Group DNS records the same way the dashboard does:
 * DKIM / sending (SPF+MX) / DMARC / receiving MX / tracking CNAME.
 * Falls back to value/type heuristics when purpose/recordTypeName are absent
 * (older DNS_CONFIG_REQUESTED payloads only had type/name/value/priority).
 */
function groupDnsConfigRecords(records: DnsConfigRecord[]) {
	const purposeOf = (r: DnsConfigRecord) => r.purpose?.toLowerCase();
	const kindOf = (r: DnsConfigRecord) =>
		(r.recordTypeName ?? "").toUpperCase() || r.type.toUpperCase();
	const valueOf = (r: DnsConfigRecord) => r.value.trim();
	const isMxType = (r: DnsConfigRecord) =>
		kindOf(r) === "MX" || r.type.toUpperCase() === "MX";

	const isDkim = (r: DnsConfigRecord) =>
		kindOf(r) === "DKIM" ||
		valueOf(r).startsWith("v=DKIM1") ||
		// Legacy CNAME-based DKIM selectors (if any still exist)
		(r.type.toUpperCase() === "CNAME" &&
			r.name.toLowerCase().includes("_domainkey"));

	const isDmarc = (r: DnsConfigRecord) =>
		kindOf(r) === "DMARC" ||
		valueOf(r).startsWith("v=DMARC1") ||
		r.name.toLowerCase().startsWith("_dmarc");

	const isSpf = (r: DnsConfigRecord) =>
		kindOf(r) === "SPF" || valueOf(r).toLowerCase().startsWith("v=spf1");

	const isReceiving = (r: DnsConfigRecord) =>
		purposeOf(r) === "receiving" ||
		(isMxType(r) && valueOf(r).toLowerCase().startsWith("inbound."));

	// Sending MX: purpose=sending, or MX that is not the receiving/inbound record
	const isSendingMx = (r: DnsConfigRecord) => {
		if (!isMxType(r) || isReceiving(r)) return false;
		const purpose = purposeOf(r);
		return purpose === "sending" || purpose === undefined;
	};

	const isTracking = (r: DnsConfigRecord) => {
		if (purposeOf(r) === "tracking") return true;
		// Tracking host is a CNAME; never treat DKIM selectors as tracking.
		if (isDkim(r)) return false;
		return kindOf(r) === "CNAME" || r.type.toUpperCase() === "CNAME";
	};

	const dkimRecords = records.filter(isDkim).map(toEmailRecord);
	// Sending group: SPF + sending MX (matches dashboard "Enable Sending")
	const sendingRecords = records
		.filter((r) => isSpf(r) || isSendingMx(r))
		.map(toEmailRecord);
	const dmarcRecords = records.filter(isDmarc).map(toEmailRecord);
	const receivingRecords = records.filter(isReceiving).map(toEmailRecord);
	const trackingRecords = records.filter(isTracking).map(toEmailRecord);

	return {
		dkimRecords,
		sendingRecords,
		dmarcRecords,
		receivingRecords,
		trackingRecords,
	};
}

export async function initDomainSubscribers() {
	// Domain Verified
	await bus.subscribe(
		BusEvent.DOMAIN_VERIFIED,
		async (payload) => {
			try {
				const domain = await db.query.domain.findFirst({
					where: and(
						eq(schema.domain.id, payload.domainId),
						eq(schema.domain.organizationId, payload.organizationId),
						isNull(schema.domain.deletedAt),
					),
					with: {
						user: true,
					},
				});

				if (!domain?.user?.email) {
					log.error({
						message: "Domain owner not found for verified email",
						domainId: payload.domainId,
						organizationId: payload.organizationId,
					});
					return;
				}

				const html = await render(
					React.createElement(DomainVerifiedEmail, {
						fullName: domain.user.name || "User",
						domain: payload.domain,
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard/domain`,
						isSendingEmailEnabled: domain.isSendingEmailEnabled,
						isReceivingEmailEnabled: domain.isReceivingEmailEnabled,
						isTrackingEnabled:
							domain.isClickTrackingEnabled || domain.isOpenTrackingEnabled,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `Reloop <support@${requireReloopSenderDomain()}>`,
					to: domain.user.email,
					subject: `Domain ${payload.domain} has been verified`,
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send domain verified email",
				});
			}
		},
		{ queue: "domain-email-worker" },
	);

	// DNS Config Requested
	await bus.subscribe(
		BusEvent.DNS_CONFIG_REQUESTED,
		async (payload) => {
			try {
				const {
					dkimRecords,
					sendingRecords,
					dmarcRecords,
					receivingRecords,
					trackingRecords,
				} = groupDnsConfigRecords(payload.records ?? []);

				const html = await render(
					React.createElement(DnsConfigEmail, {
						fullName: "User",
						domain: payload.domain,
						dkimRecords,
						sendingRecords,
						dmarcRecords,
						receivingRecords,
						trackingRecords,
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard/domain`,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `Reloop <support@${requireReloopSenderDomain()}>`,
					to: payload.email,
					subject: `DNS Configuration for ${payload.domain}`,
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send DNS config email",
				});
			}
		},
		{ queue: "domain-email-worker" },
	);
}
