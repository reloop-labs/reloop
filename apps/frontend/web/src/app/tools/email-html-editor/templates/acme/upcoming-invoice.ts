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

export function acmeUpcomingInvoiceHtml(origin: string): string {
	return acmeEmail({
		title: "Your next Acme invoice",
		preview: "Here's a preview of your next invoice before it's charged.",
		body: `${logo(origin)}
${heading("Your next invoice is coming up")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, here's a preview of your next Acme invoice. It will be charged automatically on <span data-variable="invoice_date">{{{invoice_date}}}</span>.`)}
${details([
	{ label: "Pro plan", note: "Monthly · 3 seats", value: "$48.00" },
	{ label: "Extra events", note: "50,000 add-on", value: "$12.00" },
	{ label: "Total due", value: "$60.00", strong: true },
])}
${button("{{{billing_url}}}", "Review billing")}
${text("Need to change seats or your payment method? Update them before the invoice date.", { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}
