import {
	acmeEmail,
	button,
	details,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	link,
	logo,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample, TemplateVariable } from "../index";

function termsUpdateHtml(origin: string): string {
	return acmeEmail({
		title: "We're updating our Terms of Service",
		preview: "A summary of what's changing and when it takes effect.",
		body: `${logo(origin)}
${eyebrow("Policy update")}
${heading("We're updating our terms")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've updated the Acme Terms of Service. The new terms take effect on <span data-variable="effective_date">{{{effective_date}}}</span>. Here's what changed:`)}
${step(1, "Clearer data ownership", "We spell out that the event data you collect belongs to you, not to Acme.")}
${step(2, "Updated service levels", "Uptime commitments for paid plans now live in the terms instead of a separate page.")}
${step(3, "Simpler dispute process", "We've added an informal resolution step before any formal process begins.")}
${button("{{{terms_url}}}", "Read the new terms")}
${text("If you keep using Acme after the effective date, the updated terms will apply. This email is a summary, so please read the full terms for the details.", { marginBottom: 24 })}
${fallback("{{{terms_url}}}")}
${footer()}`,
	});
}

function privacyPolicyUpdateHtml(origin: string): string {
	return acmeEmail({
		title: "An update to our Privacy Policy",
		preview: "We've made our Privacy Policy clearer and easier to read.",
		body: `${logo(origin)}
${heading("An update to our Privacy Policy")}
${lead(`We've revised the Acme Privacy Policy to make it easier to read and to reflect a few product changes. The update takes effect on <span data-variable="effective_date">{{{effective_date}}}</span>.`)}
${details([
	{
		label: "Retention periods",
		value: "Now listed by data type",
		note: "Each kind of data has its own retention period, in one table.",
	},
	{
		label: "Your choices",
		value: "New section",
		note: "How to access, export, or delete your data in one place.",
	},
	{
		label: "Selling data",
		value: "Unchanged",
		note: "We don't sell personal data, and that hasn't changed.",
	},
])}
${button("{{{privacy_url}}}", "Read the Privacy Policy")}
${text(`Questions about how we handle data? Reach our privacy team at ${link("mailto:privacy@acme.example", "privacy@acme.example")}.`, { marginBottom: 24 })}
${fallback("{{{privacy_url}}}")}
${footer()}`,
	});
}

function cookiePolicyUpdateHtml(origin: string): string {
	return acmeEmail({
		title: "Our Cookie Policy has changed",
		preview: "We've updated how we describe cookies on acme.example.",
		body: `${logo(origin)}
${heading("Our Cookie Policy has changed")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've updated the Cookie Policy for the Acme website and dashboard. It now lists every cookie we set, what it does, and how long it lasts.`)}
${text("The Acme tracking script you install on your own sites still doesn't use cookies, so nothing changes for your visitors.", { marginBottom: 28 })}
${button("{{{cookie_policy_url}}}", "View the Cookie Policy")}
${text("You can change your cookie preferences at any time from the footer of acme.example.", { marginBottom: 24 })}
${fallback("{{{cookie_policy_url}}}")}
${footer()}`,
	});
}

function dpaUpdatedHtml(origin: string): string {
	return acmeEmail({
		title: "Updated Data Processing Agreement",
		preview: "A new version of the Acme DPA is available for your workspace.",
		body: `${logo(origin)}
${heading("Our updated DPA is available")}
${lead(`A new version of the Acme Data Processing Agreement is available for <span data-variable="workspace_name">{{{workspace_name}}}</span>. It replaces the previous version from the effective date below.`)}
${details([
	{ label: "Version", value: "4.0" },
	{
		label: "Effective",
		value: `<span data-variable="effective_date">{{{effective_date}}}</span>`,
	},
	{ label: "Includes", value: "2026 SCCs, UK addendum" },
	{ label: "Signature", value: "Not required", strong: true },
])}
${button("{{{dpa_url}}}", "Review the DPA")}
${text("The DPA applies automatically as part of your agreement with Acme. If your legal team needs a countersigned copy, you can request one from the same page.", { marginBottom: 24 })}
${fallback("{{{dpa_url}}}")}
${footer()}`,
	});
}

function newSubprocessorHtml(origin: string): string {
	return acmeEmail({
		title: "Notice of a new Acme subprocessor",
		preview: "We plan to add a new subprocessor. Here's who and why.",
		body: `${logo(origin)}
${eyebrow("Subprocessor notice")}
${heading("We're adding a subprocessor")}
${lead(`As described in our DPA, we're letting you know in advance that Acme plans to start using a new subprocessor on <span data-variable="effective_date">{{{effective_date}}}</span>.`)}
${details([
	{ label: "Company", value: "Northwind Mail, Inc." },
	{ label: "Purpose", value: "Sending scheduled reports" },
	{ label: "Data processed", value: "Name, email address" },
	{ label: "Location", value: "United States" },
])}
${button("{{{subprocessors_url}}}", "View all subprocessors")}
${text("If you have a reasonable objection related to data protection, reply to this email within 30 days and we'll work through it with you.", { marginBottom: 24 })}
${fallback("{{{subprocessors_url}}}")}
${footer()}`,
	});
}

function dataRequestReceivedHtml(origin: string): string {
	return acmeEmail({
		title: "We received your data request",
		preview: "Your request is logged. We'll respond within 30 days.",
		body: `${logo(origin)}
${heading("We received your request")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've received your request to access the personal data Acme holds about you. Here's what happens next.`)}
${step(1, "Confirm it's you", "We may ask you to verify your identity so we only share data with the right person.")}
${step(2, "We gather your data", "We collect what we hold across your account, billing, and support history.")}
${step(3, "You get a copy", "We'll email you a secure link to download it, usually well before the deadline.")}
${details([
	{
		label: "Request ID",
		value: `<span data-variable="request_id">{{{request_id}}}</span>`,
	},
	{ label: "Received", value: "Oct 14, 2026" },
	{ label: "Respond by", value: "Nov 13, 2026", strong: true },
])}
${button("{{{request_url}}}", "View request")}
${fallback("{{{request_url}}}")}
${footer()}`,
	});
}

function dataDeletionCompleteHtml(origin: string): string {
	return acmeEmail({
		title: "Your data deletion request is complete",
		preview: "We've deleted the personal data you asked us to remove.",
		body: `${logo(origin)}
${heading("Your data has been deleted")}
${lead(`We've finished processing deletion request <span data-variable="request_id">{{{request_id}}}</span>. The personal data covered by the request has been removed from Acme systems.`)}
${details([
	{ label: "Account profile", value: "Deleted" },
	{ label: "Workspace memberships", value: "Removed" },
	{ label: "Backups", value: "Purged within 35 days" },
	{
		label: "Billing records",
		value: "Kept",
		note: "Invoices are retained where the law requires it.",
	},
])}
${text("This is the last email we'll send about this request. If you sign up again later, you'll start with a fresh account.", { marginBottom: 28 })}
${button("{{{privacy_url}}}", "How we handle deletion")}
${fallback("{{{privacy_url}}}")}
${footer()}`,
	});
}

function consentConfirmationHtml(origin: string): string {
	return acmeEmail({
		title: "Confirm your subscription to Acme updates",
		preview: "One click to confirm you want product updates from Acme.",
		body: `${logo(origin)}
${heading("Confirm your subscription")}
${lead(`Someone, hopefully you, asked to receive product updates from Acme at <span data-variable="email">{{{email}}}</span>. Please confirm so we know it's really you.`)}
${button("{{{confirm_url}}}", "Yes, subscribe me")}
${text("You'll get about two emails a month: new features, analytics guides, and the occasional changelog. Unsubscribe any time.", { marginBottom: 20 })}
${text("If you didn't ask for this, ignore this email and we won't send anything else.", { marginBottom: 24 })}
${fallback("{{{confirm_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function soc2ReportHtml(origin: string): string {
	return acmeEmail({
		title: "Our 2026 SOC 2 Type II report is available",
		preview: "Download the latest SOC 2 report from the Acme Trust Center.",
		body: `${logo(origin)}
${eyebrow("Trust Center")}
${heading("Our SOC 2 report is ready")}
${lead(`Acme has completed its annual SOC 2 Type II audit. The new report is available to <span data-variable="workspace_name">{{{workspace_name}}}</span> in the Trust Center.`)}
${details([
	{ label: "Report", value: "SOC 2 Type II" },
	{ label: "Audit period", value: "Oct 1, 2025 to Sep 30, 2026" },
	{ label: "Trust criteria", value: "Security, availability" },
	{ label: "Exceptions", value: "None noted", strong: true },
])}
${button("{{{trust_center_url}}}", "Download report")}
${text("The report is confidential. Workspace admins can download it after accepting a short NDA.", { marginBottom: 24 })}
${fallback("{{{trust_center_url}}}")}
${footer()}`,
	});
}

function aupViolationHtml(origin: string): string {
	return acmeEmail({
		title: "Action needed: Acceptable Use Policy",
		preview: "We noticed activity that doesn't fit our Acceptable Use Policy.",
		body: `${logo(origin)}
${heading("A note about acceptable use")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we noticed activity in <span data-variable="workspace_name">{{{workspace_name}}}</span> that doesn't fit our Acceptable Use Policy. Your workspace is still active.`)}
${details([
	{
		label: "What we saw",
		value: "Form field values in events",
		note: "Events on checkout.example.com include full email addresses and phone numbers.",
	},
	{ label: "Policy section", value: "3.2, sensitive data" },
	{
		label: "Please resolve by",
		value: `<span data-variable="deadline">{{{deadline}}}</span>`,
		strong: true,
	},
])}
${button("{{{policy_url}}}", "Review the policy")}
${text("Removing those properties from your tracking setup is usually enough. If you think we got this wrong, reply and a person on our team will take a look.", { marginBottom: 24 })}
${fallback("{{{policy_url}}}")}
${footer()}`,
	});
}

const firstName: TemplateVariable = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
};
const workspaceName: TemplateVariable = {
	name: "workspace_name",
	type: "string",
	defaultValue: "Acme Studio",
};
const effectiveDate: TemplateVariable = {
	name: "effective_date",
	type: "string",
	defaultValue: "Nov 15, 2026",
};

export const legalTemplates: EmailTemplateExample[] = [
	{
		id: "acme-terms-update",
		name: "Terms of service update",
		slug: "acme-terms-update",
		category: "legal",
		description:
			"Acme notice of updated terms with an effective date and a summary of changes.",
		html: termsUpdateHtml,
		variables: [
			firstName,
			effectiveDate,
			{ name: "terms_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-privacy-policy-update",
		name: "Privacy policy update",
		slug: "acme-privacy-policy-update",
		category: "legal",
		description:
			"Acme notice of a revised privacy policy with the key changes listed.",
		html: privacyPolicyUpdateHtml,
		variables: [
			effectiveDate,
			{ name: "privacy_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-cookie-policy-update",
		name: "Cookie policy update",
		slug: "acme-cookie-policy-update",
		category: "legal",
		description:
			"Acme notice that the cookie policy changed, and what it means for visitors.",
		html: cookiePolicyUpdateHtml,
		variables: [
			firstName,
			{ name: "cookie_policy_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-dpa-updated",
		name: "DPA updated",
		slug: "acme-dpa-updated",
		category: "legal",
		description:
			"Acme notice that a new version of the Data Processing Agreement is available.",
		html: dpaUpdatedHtml,
		variables: [
			workspaceName,
			effectiveDate,
			{ name: "dpa_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-new-subprocessor",
		name: "New subprocessor",
		slug: "acme-new-subprocessor",
		category: "legal",
		description:
			"Acme advance notice of a new subprocessor, with its purpose and location.",
		html: newSubprocessorHtml,
		variables: [
			effectiveDate,
			{ name: "subprocessors_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-data-request-received",
		name: "Data request received",
		slug: "acme-data-request-received",
		category: "legal",
		description:
			"Acme acknowledgment of a personal data access request and the steps that follow.",
		html: dataRequestReceivedHtml,
		variables: [
			firstName,
			{ name: "request_id", type: "string", defaultValue: "DSR-20481" },
			{ name: "request_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-data-deletion-complete",
		name: "Data deletion complete",
		slug: "acme-data-deletion-complete",
		category: "legal",
		description:
			"Acme confirmation that a personal data deletion request has been completed.",
		html: dataDeletionCompleteHtml,
		variables: [
			{ name: "request_id", type: "string", defaultValue: "DSR-20517" },
			{ name: "privacy_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-consent-confirmation",
		name: "Subscription opt-in",
		slug: "acme-consent-confirmation",
		category: "legal",
		description:
			"Acme double opt-in email asking a subscriber to confirm product updates.",
		html: consentConfirmationHtml,
		variables: [
			{ name: "email", type: "string", defaultValue: "jane@example.com" },
			{ name: "confirm_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-soc2-report",
		name: "SOC 2 report available",
		slug: "acme-soc2-report",
		category: "legal",
		description:
			"Acme notice that the latest SOC 2 Type II report is available in the Trust Center.",
		html: soc2ReportHtml,
		variables: [
			workspaceName,
			{ name: "trust_center_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-aup-violation",
		name: "Acceptable use warning",
		slug: "acme-aup-violation",
		category: "legal",
		description:
			"Acme calm warning about activity outside the Acceptable Use Policy, with a deadline.",
		html: aupViolationHtml,
		variables: [
			firstName,
			workspaceName,
			{ name: "deadline", type: "string", defaultValue: "Oct 28, 2026" },
			{ name: "policy_url", type: "string", defaultValue: null },
		],
	},
];
