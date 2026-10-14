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

export function acmeOrderConfirmationHtml(origin: string): string {
	return acmeEmail({
		title: "Thanks for your Acme order",
		preview: "We've received your order and we're getting it ready.",
		body: `${logo(origin)}
${heading("Thanks for your order")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've received order #<span data-variable="order_number">{{{order_number}}}</span> and we're getting it ready. We'll email you again when it ships.`)}
${details([
	{ label: "Acme Desk Sensor", note: "Charcoal · Qty 1", value: "$89.00" },
	{ label: "Mounting kit", note: "Qty 2", value: "$18.00" },
	{ label: "Shipping", value: "Free" },
	{ label: "Total", value: "$107.00", strong: true },
])}
${button("{{{order_url}}}", "View order")}
${text("Shipping to Ana Morales, 132 Sample Road, Apt 4B, Example City.", { marginBottom: 24 })}
${fallback("{{{order_url}}}")}
${footer()}`,
	});
}
