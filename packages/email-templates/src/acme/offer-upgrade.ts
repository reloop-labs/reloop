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

export function acmeOfferUpgradeHtml(origin: string): string {
	return acmeEmail({
		title: "Get Acme Pro for half price",
		preview:
			"50% off your first 3 months of Pro. More events, more seats, AI insights.",
		body: `${logo(origin)}
${heading("Get Acme Pro for half price")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, <span data-variable="workspace_name">{{{workspace_name}}}</span> is getting close to what the Free plan can hold. Upgrade now and your first 3 months of Pro are half off.`)}
${offer({
	amount: "50% off",
	label: "your first 3 months of Pro",
	code: `<span data-variable="coupon_code">{{{coupon_code}}}</span>`,
	expires: `Offer ends <span data-variable="offer_expiry">{{{offer_expiry}}}</span>`,
})}
${details([
	{ label: "Events", value: "1M / month" },
	{ label: "Team seats", value: "Unlimited" },
	{ label: "Data retention", value: "2 years" },
	{ label: "AI insights and MCP access", value: "Included" },
	{ label: "Price for 3 months", value: "$24.00 / month", strong: true },
])}
${button("{{{upgrade_url}}}", "Upgrade to Pro")}
${text("After 3 months, Pro is $48.00 / month. Cancel anytime from billing settings.", { marginBottom: 24 })}
${fallback("{{{upgrade_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}
