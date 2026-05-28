import { MailErrors } from "@reloop/be-mail/lib/errors";
import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { log } from "evlog";
import { useLogger } from "evlog/elysia";
import {
	checkDnsHealth_step3,
	createEmailLog_step4,
	finalizeEmail_step7,
	injectCustomTracking_step5c,
	injectTracking_step5b,
	parseFromAddress_step1,
	resolveTemplate_step5,
	sendEmail_step6,
	verifyDomainAuth_step2,
} from "./steps";

export async function sendEmailController({
	organizationId,
	body,
	apiKey,
	apikeyId,
	userId,
}: {
	organizationId: string;
	body: MailModel.SendEmailBody;
	apiKey: string;
	apikeyId?: string;
	userId?: string;
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
		apikeyId,
		userId,
	});

	const { finalSubject, finalHtml, finalText } = await resolveTemplate_step5({
		organizationId,
		template: body.template,
		subject: body.subject,
		html: body.html,
		text: body.text,
	});

	// Step 5b/c: Rewrite links and inject open pixel based on domain tracking flags
	let trackedHtml = finalHtml;
	const isDomainVerified =
		currentDomain.systemVerified && currentDomain.status === "active";

	const hasCustomTracking =
		isDomainVerified &&
		currentDomain.isTrackingDomain &&
		currentDomain.trackingSubdomain &&
		(currentDomain.isClickTrackingEnabled ||
			currentDomain.isOpenTrackingEnabled);

	if (hasCustomTracking) {
		trackedHtml = injectCustomTracking_step5c({
			html: finalHtml,
			emailLogId,
			clickTracking: currentDomain.isClickTrackingEnabled,
			openTracking: currentDomain.isOpenTrackingEnabled,
			trackingDomain: `${currentDomain.trackingSubdomain}.${currentDomain.domain}`,
		});
	} else {
		trackedHtml = injectTracking_step5b({
			html: finalHtml,
			emailLogId,
			clickTracking: currentDomain.isClickTrackingEnabled,
			openTracking: currentDomain.isOpenTrackingEnabled,
		});
	}

	const result = await sendEmail_step6({
		body,
		finalSubject,
		finalHtml: trackedHtml,
		finalText,
		organizationId,
		domainId: currentDomain.id,
		emailLogId,
		apiKey,
	});

	const response = await finalizeEmail_step7({
		emailLogId,
		result,
		organizationId,
		body,
	});

	log.info({
		...{
			emailLogId,
			messageId: response.messageId,
			organizationId,
		},
		message: "Email process completed successfully",
	});

	return response;
}
