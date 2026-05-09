import { MailErrors } from "@reloop/be-mailing/lib/errors";
import type { MailModel } from "@reloop/be-mailing/model/mail.model";
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

/**
 * Controller for sending an email.
 * Orchestrates the multi-step process from validation to transmission.
 */
export async function sendEmailController({
	organizationId,
	body,
}: {
	organizationId: string;
	body: MailModel.SendEmailBody;
}): Promise<MailModel.SendEmailResponse> {
	const logger = useLogger();
	logger.set({
		organizationId,
		from: body.from,
		to: body.to,
	});
	logger.info("Initiating email send process");

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
		throw MailErrors.dnsHealthError(domainName, dnsHealthCheck.missingRecords);
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
}
