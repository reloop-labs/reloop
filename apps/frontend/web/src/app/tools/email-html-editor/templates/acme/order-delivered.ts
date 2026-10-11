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

export function acmeOrderDeliveredHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme order has been delivered",
		preview: "Your order was delivered today. Here are the details.",
		body: `${logo(origin)}
${heading("Your order has been delivered")}
${lead(`Order #<span data-variable="order_number">{{{order_number}}}</span> was delivered on Thursday, Oct 15 at 2:14 PM. We hope you love it.`)}
${details([
	{ label: "Delivered to", value: "Front door" },
	{ label: "Carrier", value: "UPS Ground" },
	{ label: "Tracking", value: "1Z 999 AA1 0123 4567 84" },
])}
${button("{{{order_url}}}", "View order")}
${text(`Something wrong with your delivery? Reply to this email within 30 days and we'll make it right.`, { marginBottom: 24 })}
${fallback("{{{order_url}}}")}
${footer()}`,
	});
}
