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

export function acmeSubscriptionRenewalHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme plan renews soon",
		preview: "Your annual plan renews in 7 days. Review the details.",
		body: `${logo(origin)}
${heading("Your plan renews soon")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, your Acme Pro plan renews automatically in 7 days. No action is needed to keep everything running.`)}
${details([
	{ label: "Plan", value: "Pro · Annual" },
	{
		label: "Renews on",
		value: `<span data-variable="renewal_date">{{{renewal_date}}}</span>`,
	},
	{ label: "Charged to", value: "Visa ending in 4242" },
	{
		label: "Amount",
		value: `<span data-variable="renewal_amount">{{{renewal_amount}}}</span>`,
		strong: true,
	},
])}
${button("{{{subscription_url}}}", "Manage subscription")}
${text("Want to change your plan or seats? You can update them any time before the renewal date.", { marginBottom: 24 })}
${fallback("{{{subscription_url}}}")}
${footer()}`,
	});
}
