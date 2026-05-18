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
		// Step 1: Fetch domain and validate
		const { domainWithRecords } = await fetchDomain_step1({
			domainId,
			organizationId,
		});

		// Already in-flight — don't queue again
		if (domainWithRecords.status === "verifying") {
			log.info("Domain is already in verifying status, skipping re-queue");
			return {
				id: domainId,
				status: "verifying" as const,
				event: DOMAIN_VERIFY_WEBHOOK_EVENT.id,
			};
		}

		// Step 2: Update status to "verifying"
		await updateStatusToVerifying_step2({ domainId });

		// Step 3: Enqueue background job
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
