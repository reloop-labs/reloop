import { BusEvent, bus } from "@reloop/bus";
import { DOMAIN_VERIFY_WEBHOOK_EVENT } from "@reloop/webhook-events";

import { useLogger } from "evlog/elysia";
import {
	enqueueVerificationJob_step3,
	fetchDomain_step1,
	updateStatusToVerifying_step2,
} from "./steps";

export async function verifyDNSRecordController({
	domainId,
	organizationId,
}: {
	domainId: string;
	organizationId: string;
}) {
	const log = useLogger();
	try {
		const { domainWithRecords } = await fetchDomain_step1({
			domainId,
			organizationId,
		});
		await updateStatusToVerifying_step2({
			domainId,
			domain: domainWithRecords,
		});
		await enqueueVerificationJob_step3({
			domainId,
			organizationId,
			domainName: domainWithRecords.domain,
			previousStatus: domainWithRecords.status,
		});

		log.info("Domain verification started successfully");
		return {
			id: domainId,
			status: "verifying" as const,
			event: DOMAIN_VERIFY_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Error verifying DNS records");
		throw error;
	}
}

export async function forwardDNSController({
	domainId,
	email,
	organizationId,
}: {
	domainId: string;
	email: string;
	organizationId: string;
}) {
	const log = useLogger();
	try {
		const { domainWithRecords } = await fetchDomain_step1({
			domainId,
			organizationId,
		});

		const records = (domainWithRecords.dnsRecords || []).map((r) => ({
			type: r.recordType,
			name: r.name,
			value: r.value,
			priority: r.priority ?? undefined,
		}));

		await bus.publish(BusEvent.DNS_CONFIG_REQUESTED, {
			email,
			domain: domainWithRecords.domain,
			records,
		});

		log.info(
			`Forwarded DNS configuration for ${domainWithRecords.domain} to ${email}`,
		);
		return { success: true };
	} catch (error) {
		log.error("Error forwarding DNS configuration");
		throw error;
	}
}
