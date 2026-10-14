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

export function acmeUsageLimitReachedHtml(origin: string): string {
	return acmeEmail({
		title: "You've reached your event limit",
		preview: "Your workspace has used 100% of this month's event allowance.",
		body: `${logo(origin)}
${heading(`You've reached your event limit`)}
${lead(`<span data-variable="workspace_name">{{{workspace_name}}}</span> has reached its monthly event allowance. New events sent after the limit are rejected. Review your usage and plan to resume collection.`)}
${text("100,000 of 100,000 events used", { color: acme.ink, marginBottom: 28 })}
${button("{{{billing_url}}}", "Review usage and plan")}
${text(`Your allowance resets on Nov 1, 2026, 12:00 AM UTC. Usage is shared across websites in this workspace. Select <span data-variable="workspace_name">{{{workspace_name}}}</span> in Acme to review its plan.`, { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}
