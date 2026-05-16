import { log } from "evlog";
import { MailErrors } from "@reloop/be-mailing/lib/errors";
import type { MailModel } from "@reloop/be-mailing/model/mail.model";
import { useLogger } from "evlog/elysia";
import {
	checkDnsHealth_step3,
	createEmailLog_step4,
	finalizeEmail_step7,
	injectTracking_step5b,
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
	logger.set({
		organizationId,
		from: body.from,
		to: body.to,
	});
	log.info("server", "Initiating email send process");


	const { domainName } = parseFromAddress_step1(body.from);


	const { currentDomain } = await verifyDomainAuth_step2({
		organizationId,
		domainName,
	});


	const dnsHealthCheck = await checkDnsHealth_step3({
		domainId: currentDomain.id,
		organizationId,
		domainData: currentDomain,
	});

	if (!dnsHealthCheck.isHealthy) {
		throw MailErrors.dnsHealthError(domainName, dnsHealthCheck.missingRecords);
	}


	const { emailLogId } = await createEmailLog_step4({
		organizationId,
		domainId: currentDomain.id,
		body,
	});


	const { finalSubject, finalHtml, finalText } = await resolveTemplate_step5({
		organizationId,
		template: body.template,
		subject: body.subject,
		html: body.html,
		text: body.text,
	});


	// Step 5b: Rewrite links and inject open pixel based on domain tracking flags
	const trackedHtml = injectTracking_step5b({
		html: finalHtml,
		emailLogId,
		clickTracking: currentDomain.clickTracking,
		openTracking: currentDomain.openTracking,
	});

	const result = await sendEmail_step6({
		body,
		finalSubject,
		finalHtml: trackedHtml,
		finalText,
		organizationId,
		domainId: currentDomain.id,
		emailLogId,
	});


	const response = await finalizeEmail_step7({
		emailLogId,
		result,
		organizationId,
		body,
	});

	log.info({ ...({
		emailLogId,
		messageId: response.messageId,
		organizationId,
	}), message: "Email process completed successfully" });

	return response;
}
