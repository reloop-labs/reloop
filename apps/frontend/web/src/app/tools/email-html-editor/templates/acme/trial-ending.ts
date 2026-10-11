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

export function acmeTrialEndingHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme trial ends in 3 days",
		preview: "Add a payment method to keep your dashboards and team access.",
		body: `${logo(origin)}
${heading("Your trial ends in 3 days")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, your Acme Pro trial ends on <span data-variable="trial_end_date">{{{trial_end_date}}}</span>. Choose a plan to keep your dashboards, reports, and team access.`)}
${details([
	{ label: "Plan after trial", value: "Pro · Monthly" },
	{ label: "Price", value: "$48.00 / month" },
	{
		label: "Trial ends",
		value: `<span data-variable="trial_end_date">{{{trial_end_date}}}</span>`,
		strong: true,
	},
])}
${button("{{{billing_url}}}", "Choose a plan")}
${text(`If you don't choose a plan, your workspace moves to the Free plan. Your data stays safe either way.`, { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}
