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
		if (domainWithRecords.status === "verifying") {
			log.info("Domain is already in verifying status, skipping re-queue");
			return {
				id: domainId,
				status: "verifying" as const,
				event: DOMAIN_VERIFY_WEBHOOK_EVENT.id,
			};
		}
		await updateStatusToVerifying_step2({ domainId, domain: domainWithRecords });
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
