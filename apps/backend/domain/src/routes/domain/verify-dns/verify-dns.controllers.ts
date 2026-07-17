import { BusEvent, bus } from "@reloop/bus";
import { ensureReceivingMxRecord } from "@reloop/domain/utils/ensure-receiving-mx";
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
		let { domainWithRecords } = await fetchDomain_step1({
			domainId,
			organizationId,
		});

		// Repair legacy receiving MX (wrong name/value) so verification and the
		// dashboard show the apex/@ → inbound.{HOST_DOMAIN} record users must add.
		if (domainWithRecords.isReceivingEmailEnabled) {
			await ensureReceivingMxRecord({
				domainId,
				organizationId,
				userId: domainWithRecords.userId,
				domain: domainWithRecords.domain,
			});
			({ domainWithRecords } = await fetchDomain_step1({
				domainId,
				organizationId,
			}));
		}

		await updateStatusToVerifying_step2({
			domainId,
			domain: domainWithRecords,
		});
		await enqueueVerificationJob_step3({
			domainId,
			organizationId,
			domainName: domainWithRecords.domain,
			previousStatus: domainWithRecords.status,
			previousUserVerifiedDomain: domainWithRecords.userVerifiedDomain,
			previousDnsStatuses: domainWithRecords.dnsRecords.map((r) => ({
				id: r.id,
				status: r.status,
			})),
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
