import {
	acmeEmail,
	button,
	fallback,
	footer,
	heading,
	lead,
	logo,
	text,
} from "./theme";

export function acmeAccountDeletedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme account has been deleted",
		preview: "Your account was deleted as requested. Here's what happens next.",
		body: `${logo(origin)}
${heading("Your account has been deleted")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, your Acme account and its workspaces were deleted on Oct 11, 2026, as you requested.`)}
${text("Your data will be permanently erased from our backups within 30 days. Until then, you can restore your account by contacting support.", { marginBottom: 28 })}
${button("{{{support_url}}}", "Contact support")}
${text(`Didn't request this? Reply to this email right away and we'll help.`, { marginBottom: 24 })}
${fallback("{{{support_url}}}")}
${footer()}`,
	});
}
