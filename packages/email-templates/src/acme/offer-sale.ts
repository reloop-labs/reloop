import {
	acme,
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

function was(price: string): string {
	return `<span style="color:${acme.muted};text-decoration:line-through">${price}</span>&nbsp; `;
}

export function acmeOfferSaleHtml(origin: string): string {
	return acmeEmail({
		title: "Our biggest sale of the year: 40% off",
		preview: "40% off any yearly Acme plan. Ends soon.",
		body: `${logo(origin)}
${heading("Our biggest sale of the year")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, for a few days only, every yearly Acme plan is 40% off. Lock in the price for your whole first year.`)}
${offer({
	amount: "40% off",
	label: "any yearly plan",
	code: `<span data-variable="coupon_code">{{{coupon_code}}}</span>`,
	expires: `Ends <span data-variable="offer_expiry">{{{offer_expiry}}}</span> at midnight UTC`,
})}
${details([
	{
		label: "Starter",
		note: "100K events / month",
		value: `${was("$192")}$115.20 / year`,
	},
	{
		label: "Pro",
		note: "1M events / month",
		value: `${was("$576")}$345.60 / year`,
	},
	{
		label: "Business",
		note: "10M events / month",
		value: `${was("$1,920")}$1,152 / year`,
	},
])}
${button("{{{offer_url}}}", "Claim 40% off")}
${text("Already on a yearly plan? The discount applies to your next renewal.", { marginBottom: 24 })}
${fallback("{{{offer_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}
