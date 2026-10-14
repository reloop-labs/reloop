import {
	acmeEmail,
	button,
	details,
	fallback,
	footer,
	heading,
	lead,
	logo,
	offer,
	text,
} from "./theme";

export function acmeOfferAnnualHtml(origin: string): string {
	return acmeEmail({
		title: "Save 20% when you switch to yearly",
		preview: "Two months free when you move Acme Pro to yearly billing.",
		body: `${logo(origin)}
${heading("Save 20% when you switch to yearly")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, you've been on Acme Pro for a while now. Move to yearly billing and keep 20% of what you'd pay monthly.`)}
${offer({
	amount: "20% off",
	label: "Acme Pro, billed yearly",
	code: `<span data-variable="coupon_code">{{{coupon_code}}}</span>`,
	expires: `Offer ends <span data-variable="offer_expiry">{{{offer_expiry}}}</span>`,
})}
${details([
	{ label: "Monthly", value: "$48.00 / month" },
	{
		label: "Yearly with this offer",
		value: "$38.40 / month",
		note: "$460.80 billed once a year",
		strong: true,
	},
])}
${button("{{{offer_url}}}", "Switch to yearly")}
${text("Your plan, limits, and data stay exactly the same. Only the billing changes.", { marginBottom: 24 })}
${fallback("{{{offer_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}
