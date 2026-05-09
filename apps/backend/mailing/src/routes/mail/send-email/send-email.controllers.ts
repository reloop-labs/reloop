import type { MailModel } from "@reloop/be-mailing/model/mail.model.js";
import { useLogger } from "evlog/elysia";
import {
	checkDnsHealth_step3,
	createEmailLog_step4,
	finalizeEmail_step7,
	parseFromAddress_step1,
	resolveTemplate_step5,
	sendEmail_step6,
	verifyDomainAuth_step2,
} from "./steps";

export async function sendEmailController({
	organizationId,
	body,
}: {
	organizationId: string;
	body: MailModel.SendEmailBody;
}): Promise<MailModel.SendEmailResponse> {
	const logger = useLogger();
	try {
		logger.info("Initiating email send process", {
			organizationId,
			from: body.from,
			to: body.to,
		});

		// Step 1: Parse 'from' address
		const { domainName } = parseFromAddress_step1(body.from);

		// Step 2: Verify domain authorization
		const { currentDomain } = await verifyDomainAuth_step2({
			organizationId,
			domainName,
		});

		// Step 3: Check DNS health
		const dnsHealthCheck = await checkDnsHealth_step3({
			domainId: currentDomain.id,
			organizationId,
		});

		if (!dnsHealthCheck.isHealthy) {
			throw new Error(
				`Domain ${domainName} has invalid DNS records: ${dnsHealthCheck.missingRecords.join(", ")}`,
			);
		}

		// Step 4: Create initial log
		const { emailLogId } = await createEmailLog_step4({
			organizationId,
			domainId: currentDomain.id,
			body,
		});

		// Step 5: Resolve template and substitute variables
		const { finalSubject, finalHtml, finalText } = await resolveTemplate_step5({
			organizationId,
			template: body.template,
			subject: body.subject,
			html: body.html,
			text: body.text,
		});

		// Step 6: Send via KumoMTA
		const result = await sendEmail_step6({
			body,
			finalSubject,
			finalHtml,
			finalText,
			organizationId,
			domainId: currentDomain.id,
			emailLogId,
		});

		// Step 7: Finalize log and emit event
		const response = await finalizeEmail_step7({
			emailLogId,
			result,
			organizationId,
			body,
		});

		logger.info("Email process completed successfully", {
			emailLogId,
			messageId: response.messageId,
			organizationId,
		});

		return response;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		logger.error("Email send process failed", {
			error: errorMessage,
			organizationId,
		});
		throw error;
	}
}
