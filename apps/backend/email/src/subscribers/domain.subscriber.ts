import { BusEvent, bus } from "@reloop/bus";
import { logger } from "@reloop/logger";
import { render } from "../../render";
import { emailConfig } from "../email.config";
import { sendEmail } from "../utils/email";
import DomainVerifiedEmail from "../../emails/domain-verified";
import DnsConfigEmail from "../../emails/dns-config";
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
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard/domains`,
					}),
				);

				await sendEmail({
					from: `Reloop <support@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: "admin@example.com", // This should probably come from organization/user
					subject: `Domain ${payload.domain} has been verified`,
					html,
				});
			} catch (error) {
				logger.error(
					{ error, payload },
					"Failed to send domain verified email",
				);
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
					.filter(
						(r) => r.type === "CNAME" && r.name.includes("_domainkey"),
					)
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
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard/domains`,
					}),
				);

				await sendEmail({
					from: `Reloop <support@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: `DNS Configuration for ${payload.domain}`,
					html,
				});
			} catch (error) {
				logger.error({ error, payload }, "Failed to send DNS config email");
			}
		},
		{ queue: "domain-email-worker" },
	);
}
