import {
	acmeEmail,
	button,
	fallback,
	footer,
	heading,
	lead,
	logo,
	offer,
	text,
} from "./theme";

export function acmeOfferTrialExtensionHtml(origin: string): string {
	return acmeEmail({
		title: "Need more time? Here's 7 more days",
		preview: "Extend your Acme Pro trial by a week, no card required.",
		body: `${logo(origin)}
${heading("Need more time? Here's 7 more days")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, your Pro trial ends on <span data-variable="trial_end_date">{{{trial_end_date}}}</span>. If you haven't had a chance to try everything yet, take another week on us.`)}
${offer({
	amount: "+7 days",
	label: "added to your Pro trial",
	expires: "No card required",
})}
${button("{{{extend_url}}}", "Extend my trial")}
${text("Make the most of it: connect the MCP server to your AI assistant, or install the CLI and send your first events from the terminal.", { marginBottom: 24 })}
${fallback("{{{extend_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}
