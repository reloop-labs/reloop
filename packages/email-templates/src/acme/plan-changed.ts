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

export function acmePlanChangedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme plan has been upgraded",
		preview: "You're now on the Business plan. New limits apply right away.",
		body: `${logo(origin)}
${heading("Your plan has been upgraded")}
${lead(`<span data-variable="workspace_name">{{{workspace_name}}}</span> is now on the Business plan. Your new limits apply right away.`)}
${details([
	{ label: "Previous plan", value: "Pro" },
	{ label: "New plan", value: "Business" },
	{ label: "Monthly events", value: "1,000,000" },
	{ label: "Next invoice", value: "$199.00 on Nov 1, 2026", strong: true },
])}
${button("{{{billing_url}}}", "View billing")}
${text(`We've prorated the difference for the rest of this billing period.`, { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}
