import {
	acmeEmail,
	button,
	details,
	fallback,
	footer,
	heading,
	lead,
	logo,
	text,
} from "./theme";

export function acmeSubscriptionCanceledHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme subscription has been canceled",
		preview:
			"Your plan is canceled. You keep Pro features until your period ends.",
		body: `${logo(origin)}
${heading("Your subscription has been canceled")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've canceled your Acme Pro plan as requested. You'll keep Pro features until the end of your billing period.`)}
${details([
	{ label: "Plan", value: "Pro · Annual" },
	{
		label: "Access until",
		value: `<span data-variable="access_until">{{{access_until}}}</span>`,
	},
	{ label: "Future charges", value: "None" },
])}
${button("{{{billing_url}}}", "Reactivate plan")}
${text(`We'd love to know why you're leaving. Reply to this email with any feedback, we read every one.`, { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}
