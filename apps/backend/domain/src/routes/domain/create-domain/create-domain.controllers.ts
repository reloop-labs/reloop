import type { DomainTypes } from "@reloop/domain/types/domain.type";
import { useLogger } from "evlog/elysia";
import {
	checkExistingDomain_step1,
	createDnsRecords_step5,
	createDomainEntry_step4,
	finalizeDomainCreation_step6,
	generateDnsRecords_step3,
	handleUndelete_step2,
} from "./steps";

export async function createDomainController({
	organizationId,
	userId,
	domain,
	custom_return_path: customReturnPath,
	click_tracking: clickTracking,
	open_tracking: openTracking,
	tls,
	sending_email: sendingEmail,
	receiving_email: receivingEmail,
}: {
	organizationId: string;
	userId: string;
} & DomainTypes.CreateDomainRequest): Promise<DomainTypes.DomainResponse> {
	const logger = useLogger();
	try {
		// Step 1: Check if domain already exists
		const { deletedDomain } = await checkExistingDomain_step1({
			domain,
			organizationId,
		});

		// Step 2: Handle undelete if it was previously deleted
		const undeletedResponse = await handleUndelete_step2({
			deletedDomain,
			organizationId,
			domain,
			customReturnPath,
			clickTracking,
			openTracking,
			tls,
			sendingEmail,
			receivingEmail,
		});

		if (undeletedResponse) {
			return undeletedResponse;
		}

		// Step 3: Generate DNS records
		const { dnsRecords, receivingMxRecord } = await generateDnsRecords_step3({
			domain,
			customReturnPath,
		});

		// Step 4: Create new domain entry
		const { domainId } = await createDomainEntry_step4({
			userId,
			organizationId,
			domain,
			customReturnPath,
			clickTracking,
			openTracking,
			tls,
			sendingEmail,
			receivingEmail,
		});

		// Step 5: Create DNS records in database
		await createDnsRecords_step5({
			domainId,
			organizationId,
			userId,
			domain,
			dnsRecords,
			receivingMxRecord,
		});

		// Step 6: Finalize creation and return response
		return await finalizeDomainCreation_step6({
			domainId,
			organizationId,
			domain,
		});
	} catch (error) {
		console.error(`Error creating domain: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
