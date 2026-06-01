import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";
import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";

export async function sendTestEmail(params: {
	templateId: string;
	organizationId: string;
	to: string;
	fromEmail?: string;
	subject?: string;
	html?: string;
	variables: Record<string, any>;
}) {
	const {
		templateId,
		organizationId,
		to,
		fromEmail,
		subject,
		html,
		variables,
	} = params;

	// 1. Verify template exists and belongs to the organization
	const template = await templateModel.findByIdAndOrg(templateId, organizationId);
	if (!template) {
		throw TemplateErrors.notFound(templateId);
	}

	// 2. Resolve parameters (prioritize explicit body fields, then template baseline, then fallback defaults)
	const resolvedFromEmail = fromEmail || template.fromEmail;
	if (!resolvedFromEmail) {
		throw TemplateErrors.testFailed(
			"Sender email is required to send a test email. Configure it in template details.",
			"Go to the template editor details and set a valid From Email."
		);
	}

	const resolvedSubject = subject || template.subject || "Test Email";

	// 3. Resolve the HTML template code
	let resolvedHtml = html;
	if (!resolvedHtml) {
		// Fetch the latest version (draft or published)
		const latestVersion = await templateVersionModel.getLatestVersion(templateId);
		resolvedHtml = latestVersion?.renderedHtml || "";
	}

	if (!resolvedHtml) {
		throw TemplateErrors.testFailed(
			"Template HTML content is empty. Add content to the template before testing.",
			"Add some content using the editor, or save a draft first."
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

	// 6. Publish the SEND_TEST_EMAIL event via NATS
	log.info({
		message: "Publishing SEND_TEST_EMAIL NATS event",
		templateId,
		organizationId,
		to,
		from: resolvedFromEmail,
		subject: finalSubject,
	});

	try {
		await bus.publish(BusEvent.SEND_TEST_EMAIL, {
			to,
			from: resolvedFromEmail,
			subject: finalSubject,
			html: finalHtml,
		});
	} catch (error) {
		log.error({
			message: "Failed to publish SEND_TEST_EMAIL NATS event",
			error: error instanceof Error ? error.message : String(error),
		});
		throw TemplateErrors.testFailed(
			"Failed to queue the test email via the message bus.",
			"Verify that the NATS server is running."
		);
	}

	return { success: true };
}
