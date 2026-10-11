import {
	acme,
	acmeEmail,
	button,
	fallback,
	footer,
	heading,
	lead,
	logo,
	text,
} from "./theme";

export function acmeUsageAlertHtml(origin: string): string {
	return acmeEmail({
		title: "You're nearing your event limit",
		preview: "Your workspace has used 80% of this month's event allowance.",
		body: `${logo(origin)}
${heading("You're nearing your event limit")}
${lead(`<span data-variable="workspace_name">{{{workspace_name}}}</span> has used at least 80% of its monthly event allowance. Review your usage before reaching the limit to avoid gaps in collection.`)}
${text("80,000 of 100,000 events used", { color: acme.ink, marginBottom: 28 })}
${button("{{{billing_url}}}", "Review usage and plan")}
${text(`Your allowance resets on Nov 1, 2026, 12:00 AM UTC. Usage is shared across websites in this workspace. Select <span data-variable="workspace_name">{{{workspace_name}}}</span> in Acme to review its plan.`, { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}
