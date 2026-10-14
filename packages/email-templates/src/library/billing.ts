import {
	acme,
	acmeEmail,
	button,
	details,
	fallback,
	footer,
	heading,
	lead,
	link,
	logo,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

function cardExpiringHtml(origin: string): string {
	return acmeEmail({
		title: "Your card on file expires soon",
		preview: "Update your payment method before your next renewal.",
		body: `${logo(origin)}
${heading("Your card expires soon")}
${lead(`Hi ${v("first_name")}, the card we have on file for ${v("workspace_name")} expires at the end of this month. Update it now so your next renewal goes through without a hitch.`)}
${details([
	{ label: "Card", value: `Visa ending in ${v("card_last4")}` },
	{ label: "Expires", value: v("card_expiry") },
	{ label: "Next renewal", value: v("renewal_date"), strong: true },
])}
${button("{{{billing_url}}}", "Update payment method")}
${text("It only takes a minute, and nothing about your plan or data changes.", { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}

function invoicePaidHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme invoice is paid",
		preview: "Invoice for October 2026 is paid and ready to download.",
		body: `${logo(origin)}
${heading("Your invoice is paid")}
${lead(`Thanks, ${v("first_name")}. We've received payment for ${v("workspace_name")}. Your invoice is ready if you need it for your records.`)}
${text(`<span style="font-size:32px;line-height:40px;font-weight:600;letter-spacing:-0.02em;color:${acme.ink}">${v("amount_paid")}</span><br />Paid on ${v("paid_date")}`, { marginBottom: 28 })}
${details([
	{ label: "Invoice", value: v("invoice_number") },
	{ label: "Billing period", value: "Oct 1 to Oct 31, 2026" },
	{ label: "Payment method", value: "Visa ending in 4242" },
])}
${button("{{{invoice_url}}}", "Download invoice")}
${text(`Need to add a VAT number or change the billing address? ${link("{{{billing_url}}}", "Update billing details")} and future invoices will include it.`, { marginBottom: 24 })}
${fallback("{{{invoice_url}}}")}
${footer()}`,
	});
}

export const billingTemplates: EmailTemplateExample[] = [
	{
		id: "acme-card-expiring",
		name: "Card expiring",
		slug: "acme-card-expiring",
		category: "billing",
		description:
			"Acme reminder to update a card that expires before the next renewal.",
		html: cardExpiringHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "card_last4", type: "string", defaultValue: "4242" },
			{ name: "card_expiry", type: "string", defaultValue: "10 / 2026" },
			{ name: "renewal_date", type: "string", defaultValue: "Nov 1, 2026" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-invoice-paid",
		name: "Invoice paid",
		slug: "acme-invoice-paid",
		category: "billing",
		description:
			"Acme confirmation that an invoice was paid, with a link to download it.",
		html: invoicePaidHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "amount_paid", type: "string", defaultValue: "$48.00" },
			{ name: "paid_date", type: "string", defaultValue: "Oct 1, 2026" },
			{ name: "invoice_number", type: "string", defaultValue: "INV-2026-0142" },
			{ name: "invoice_url", type: "string", defaultValue: null },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
];
