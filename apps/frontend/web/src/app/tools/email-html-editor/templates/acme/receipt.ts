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

export function acmeReceiptHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme receipt",
		preview: "Thanks for your order. Here's your receipt.",
		body: `${logo(origin)}
${heading(`Receipt for order #<span data-variable="order_number">{{{order_number}}}</span>`)}
${lead(`Thanks, <span data-variable="first_name">{{{first_name}}}</span>. Your payment went through. Here's a summary for your records.`)}
${details([
	{ label: "Pro plan", note: "Monthly · 3 seats", value: "$48.00" },
	{ label: "Extra events", note: "50,000 add-on", value: "$12.00" },
	{ label: "Tax", value: "$4.80" },
	{ label: "Total paid", value: "$64.80", strong: true },
])}
${button("{{{invoice_url}}}", "View invoice")}
${text("Paid with Visa ending in 4242 on Oct 10, 2026. Questions about this charge? Reply to this email.", { marginBottom: 24 })}
${fallback("{{{invoice_url}}}")}
${footer()}`,
	});
}
