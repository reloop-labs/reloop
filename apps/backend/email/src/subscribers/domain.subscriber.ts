import { BusEvent, bus } from "@reloop/bus";
import { emailConfig } from "@reloop/email/email.config";
import DnsConfigEmail from "@reloop/email/emails/dns-config";
import DomainVerifiedEmail from "@reloop/email/emails/domain-verified";
import { render, toPlainText } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { log } from "evlog";
import React from "react";

export async function initDomainSubscribers() {
	// Domain Verified
	await bus.subscribe(
		BusEvent.DOMAIN_VERIFIED,
		async (payload) => {
			try {
				const html = await render(
					React.createElement(DomainVerifiedEmail, {
						fullName: "User", // Default to User if not provided in payload
						domain: payload.domain,
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard/domain`,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `Reloop <support@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: "admin@example.com", // This should probably come from organization/user
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
				const dkimRecords = payload.records
					.filter((r) => r.type === "CNAME" && r.name.includes("_domainkey"))
					.map((r) => ({
						recordType: r.type,
						recordTypeName: r.type,
						name: r.name,
						value: r.value,
						ttl: "auto",
						priority: r.priority ?? null,
					}));

				const spfRecords = payload.records
					.filter((r) => r.type === "TXT" && r.value.includes("v=spf1"))
					.map((r) => ({
						recordType: r.type,
						recordTypeName: r.type,
						name: r.name,
						value: r.value,
						ttl: "auto",
						priority: r.priority ?? null,
					}));

				const dmarcRecords = payload.records
					.filter((r) => r.type === "TXT" && r.name.startsWith("_dmarc"))
					.map((r) => ({
						recordType: r.type,
						recordTypeName: r.type,
						name: r.name,
						value: r.value,
						ttl: "auto",
						priority: r.priority ?? null,
					}));

				const html = await render(
					React.createElement(DnsConfigEmail, {
						fullName: "User",
						domain: payload.domain,
						dkimRecords,
						spfRecords,
						dmarcRecords,
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard/domain`,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `Reloop <support@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
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
