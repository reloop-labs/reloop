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

export function acmeRefundHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme refund is on its way",
		preview: "We've issued your refund. Here are the details.",
		body: `${logo(origin)}
${heading("Your refund is on its way")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've issued your refund. Here's everything you need for your records.`)}
${details([
	{
		label: "Order",
		value: `#<span data-variable="order_number">{{{order_number}}}</span>`,
	},
	{ label: "Returning to", value: "Visa ending in 4242" },
	{ label: "Expected arrival", value: "5 to 10 business days" },
	{
		label: "Amount refunded",
		value: `<span data-variable="refund_amount">{{{refund_amount}}}</span>`,
		strong: true,
	},
])}
${button("{{{refund_url}}}", "View refund details")}
${text("Your bank may take a few days to show the credit. You don't need to do anything else.", { marginBottom: 24 })}
${fallback("{{{refund_url}}}")}
${footer()}`,
	});
}
