import { applySpamhausDblCheck } from "@reloop/db/spamhaus-dbl";
import { domainConfig } from "@reloop/domain/domain.config";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import { ensureOwnershipRecord } from "@reloop/domain/lib/domain-ownership";
import { isReservedDomain } from "@reloop/domain/lib/reserved-domains";
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
	click_tracking: clickTracking = true,
	open_tracking: openTracking = true,
	tls,
	sending_email: sendingEmail = true,
	receiving_email: receivingEmail = true,
}: {
	organizationId: string;
	userId: string;
} & DomainTypes.CreateDomainRequest): Promise<DomainTypes.DomainResponse> {
	const log = useLogger();
	// Fixed server defaults — not accepted from the API body.
	const customReturnPath = domainConfig.constants.defaultCustomReturnPath;
	const trackingSubdomain = domainConfig.constants.defaultTrackingSubdomain;

	try {
		if (/^www\./i.test(domain)) {
			throw DomainErrors.invalidDomain(
				domain,
				"Domains starting with 'www.' are not supported. Please use a root domain or a non-www subdomain.",
			);
		}

		if (isReservedDomain(domain)) {
			throw DomainErrors.invalidDomain(
				domain,
				`"${domain}" is reserved for Reloop platform mail and cannot be added as a customer domain.`,
			);
		}

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
			trackingSubdomain,
			clickTracking,
			openTracking,
			tls,
			isSendingEmailEnabled: sendingEmail,
			isReceivingEmailEnabled: receivingEmail,
		});

		if (undeletedResponse) {
			await applySpamhausDblCheck({
				domainId: undeletedResponse.id,
				domainName: undeletedResponse.domain,
			});
			return undeletedResponse;
		}

		// Step 3: Generate DNS records
		const { dnsRecords, receivingMxRecord, trackingRecord } =
			await generateDnsRecords_step3({
				domain,
				trackingSubdomain,
			});

		// Step 4: Create new domain entry
		const { domainId } = await createDomainEntry_step4({
			userId,
			organizationId,
			domain,
			customReturnPath,
			trackingSubdomain,
			clickTracking,
			openTracking,
			tls,
			isSendingEmailEnabled: sendingEmail,
			isReceivingEmailEnabled: receivingEmail,
		});

		// Step 5: Create DNS records in database
		await createDnsRecords_step5({
			domainId,
			organizationId,
			userId,
			domain,
			dnsRecords,
			receivingMxRecord,
			trackingRecord,
		});

		// Already added in another org: anyone may add it, but only an org that
		// publishes this ownership TXT can verify it (and take it over).
		await ensureOwnershipRecord({ domainId, organizationId, userId, domain });

		await applySpamhausDblCheck({ domainId, domainName: domain });

		// Step 6: Finalize creation and return response
		return await finalizeDomainCreation_step6({
			domainId,
			organizationId,
			domain,
		});
	} catch (error) {
		log.error(
			`Error creating domain: ${error instanceof Error ? error.message : String(error)}`,
		);
		throw error;
	}
}
