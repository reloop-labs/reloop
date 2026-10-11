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

export function acmeOrderShippedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme order is on its way",
		preview: "Your order has shipped and should arrive Thursday.",
		body: `${logo(origin)}
${heading("Your order is on its way")}
${lead(`Good news, <span data-variable="first_name">{{{first_name}}}</span>. Order #<span data-variable="order_number">{{{order_number}}}</span> left our warehouse this morning.`)}
${details([
	{ label: "Acme Desk Sensor", note: "Charcoal · Qty 1", value: "$89.00" },
	{ label: "Mounting kit", note: "Qty 2", value: "$18.00" },
	{ label: "Carrier", value: "UPS Ground" },
	{ label: "Estimated arrival", value: "Thursday, Oct 15", strong: true },
])}
${button("{{{tracking_url}}}", "Track your package")}
${text("Shipping to Ana Morales, 132 Sample Road, Apt 4B, Example City.", { marginBottom: 24 })}
${fallback("{{{tracking_url}}}")}
${footer()}`,
	});
}
