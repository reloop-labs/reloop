import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";
import { templateConfig } from "@be/template/template.config";
import {
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "@reloop/auth/middleware";
import { log } from "evlog";

export async function sendTestEmail(params: {
	templateId: string;
	organizationId: string;
	userId?: string;
	to: string;
	fromEmail?: string;
	subject?: string;
	html?: string;
	variables: Record<string, any>;
}) {
	const {
		templateId,
		organizationId,
		userId,
		to,
		fromEmail,
		subject,
		html,
		variables,
	} = params;

	// 1. Verify template exists and belongs to the organization
	const template = await templateModel.findByIdAndOrg(
		templateId,
		organizationId,
	);
	if (!template) {
		throw TemplateErrors.notFound(templateId);
	}

	// 2. Resolve parameters (prioritize explicit body fields, then template baseline, then fallback defaults)
	const resolvedFromEmail = fromEmail || template.fromEmail;
	if (!resolvedFromEmail) {
		throw TemplateErrors.testFailed(
			"Sender email is required to send a test email. Configure it in template details.",
			"Go to the template editor details and set a valid From Email.",
		);
	}

	const resolvedSubject = subject || template.subject || "Test Email";

	// 3. Resolve the HTML template code
	let resolvedHtml = html;
	if (!resolvedHtml) {
		// Fetch the latest version (draft or published)
		const latestVersion =
			await templateVersionModel.getLatestVersion(templateId);
		resolvedHtml = latestVersion?.renderedHtml || "";
	}

	if (!resolvedHtml) {
		throw TemplateErrors.testFailed(
			"Template HTML content is empty. Add content to the template before testing.",
			"Add some content using the editor, or save a draft first.",
		);
	}

	// 4. Resolve variables: merge default variables configured on the template with the provided test variables
	const mergedVariables: Record<string, string | number> = {};

	// A. Reserved default variables
	const RESERVED_VARIABLES: Record<string, string> = {
		FIRST_NAME: "John",
		LAST_NAME: "Doe",
		EMAIL: to,
		UNSUBSCRIBE_URL: "https://reloop.sh/unsubscribe",
	};
	for (const [key, val] of Object.entries(RESERVED_VARIABLES)) {
		mergedVariables[key] = val;
	}

	// B. Template's defined default values
	const templateVariables = (template.variables as any[]) || [];
	for (const v of templateVariables) {
		if (v && typeof v === "object" && v.name) {
			if (v.defaultValue !== undefined && v.defaultValue !== null) {
				mergedVariables[v.name] = v.defaultValue;
			}
		}
	}

	// C. Custom input variables (override defaults)
	for (const [key, val] of Object.entries(variables)) {
		if (val !== undefined && val !== null && val !== "") {
			mergedVariables[key] = val;
		}
	}

	// 5. Substitute placeholders in the subject and HTML content
	const substitute = (str: string) => {
		let substituted = str;
		for (const [key, value] of Object.entries(mergedVariables)) {
			// Matches both {{{key}}} and {{{ key }}}
			const regex = new RegExp(`{{{\\s*${key}\\s*}}}`, "g");
			substituted = substituted.replace(regex, String(value));
		}
		return substituted;
	};

	const finalSubject = substitute(resolvedSubject);
	const finalHtml = substitute(resolvedHtml);

	const effectiveUserId = userId || template.createdByUserId || "";

	// 6. Send the test email via the Mail service to use the organization's credits and verified domain
	log.info({
		message: "Sending template test email via mail service",
		templateId,
		organizationId,
		userId: effectiveUserId,
		to,
		from: resolvedFromEmail,
		subject: finalSubject,
	});

	const mailBaseUrl = (
		process.env.MAIL_INTERNAL_BASE_URL || templateConfig.BASE_URL
	).replace(/\/$/, "");
	const url = `${mailBaseUrl}/api/mail/v1/send`;

	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"user-agent": "reloop-template/1.0",
				[INTERNAL_SECRET_HEADER]: templateConfig.RELOOP_INTERNAL_SECRET,
				[INTERNAL_USER_ID_HEADER]: effectiveUserId,
				[INTERNAL_ORG_ID_HEADER]: organizationId,
			},
			body: JSON.stringify({
				from: resolvedFromEmail,
				to,
				subject: finalSubject,
				html: finalHtml,
				reply_to: template.replyTo || undefined,
				tags: [
					{ name: "template", value: templateId },
					{ name: "test", value: "true" },
				],
			}),
		});

		const payload = (await res.json().catch(() => ({}))) as {
			id?: string;
			messageId?: string;
			message?: string;
			why?: string;
			fix?: string;
		};

		if (!res.ok) {
			const why =
				payload.why ||
				payload.message ||
				`Mail service returned status ${res.status}`;
			log.error({
				message: "Template test email send failed via mail service",
				status: res.status,
				why,
				to,
			});
			throw TemplateErrors.testFailed(why, payload.fix);
		}
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"status" in error &&
			(error as any).status === 400
		) {
			throw error;
		}
		log.error({
			message: "Failed to send template test email",
			error: error instanceof Error ? error.message : String(error),
		});
		throw TemplateErrors.testFailed(
			error instanceof Error ? error.message : "Failed to send test email.",
			"Check that the sender domain is verified and you have sufficient email credits.",
		);
	}

	return { success: true };
}
