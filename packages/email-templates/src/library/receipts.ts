import {
	acmeEmail,
	button,
	details,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	logo,
	offer,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/** Inline variable span, e.g. v("first_name") → {{{first_name}}}. */
function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

function invoiceNet30Html(origin: string): string {
	return acmeEmail({
		title: "New Acme invoice, due in 30 days",
		preview: "Invoice for your Business plan, payable by bank transfer.",
		body: `${logo(origin)}
${heading(`Invoice ${v("invoice_number")}`)}
${lead(`Hi ${v("first_name")}, here's the invoice for ${v("company_name")}'s Acme Business plan. Payment is due by ${v("due_date")}.`)}
${details([
	{ label: "Business plan", note: "Yearly · 25 seats", value: "$4,800.00" },
	{ label: "Extra events", note: "5M add-on", value: "$600.00" },
	{ label: "Tax", value: "$0.00" },
	{ label: "Amount due", value: "$5,400.00", strong: true },
])}
${button("{{{invoice_url}}}", "View and pay invoice")}
${text(`Pay by card or bank transfer. Please include ${v("invoice_number")} as the payment reference so we can match it.`, { marginBottom: 24 })}
${fallback("{{{invoice_url}}}")}
${footer()}`,
	});
}

function annualReceiptHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme annual receipt",
		preview: "Thanks for another year with Acme.",
		body: `${logo(origin)}
${eyebrow("Yearly plan renewed")}
${heading("Thanks for another year")}
${lead(`Hi ${v("first_name")}, your Acme Pro plan renewed for another year. You saved $115.20 compared with paying monthly.`)}
${details([
	{ label: "Pro plan", note: `Yearly · ${v("period")}`, value: "$576.00" },
	{ label: "Annual discount", value: "−$115.20" },
	{ label: "Tax", value: "$36.86" },
	{ label: "Total paid", value: "$497.66", strong: true },
])}
${button("{{{invoice_url}}}", "Download receipt")}
${text("Paid with Visa ending in 4242 on Oct 14, 2026. Need to add a VAT number or company address? Update it in billing and we'll reissue the receipt.", { marginBottom: 24 })}
${fallback("{{{invoice_url}}}")}
${footer()}`,
	});
}

function creditAppliedHtml(origin: string): string {
	return acmeEmail({
		title: "A credit was applied to your Acme account",
		preview: "Your next invoice will be lower.",
		body: `${logo(origin)}
${heading("We've added a credit to your account")}
${lead(`Hi ${v("first_name")}, we applied a ${v("credit_amount")} credit to ${v("workspace_name")} to make up for the reporting delay on Oct 9. It comes off your next invoice automatically.`)}
${details([
	{ label: "Next invoice", value: "$64.80" },
	{ label: "Account credit", value: `−${v("credit_amount")}` },
	{ label: "Estimated total on Nov 1", value: "$40.80", strong: true },
])}
${button("{{{billing_url}}}", "View billing")}
${text("Any credit left over rolls forward to the following invoice. It never expires.", { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}

function partialRefundHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme partial refund is on its way",
		preview: "We refunded part of your order.",
		body: `${logo(origin)}
${heading("Your partial refund is on its way")}
${lead(`Hi ${v("first_name")}, we refunded part of order #${v("order_number")}. The rest of your order isn't affected.`)}
${details([
	{ label: "Mounting kit", note: "Qty 2 · Arrived damaged", value: "$18.00" },
	{ label: "Shipping refund", value: "$0.00" },
	{ label: "Refunded", value: "$18.00", strong: true },
])}
${button("{{{order_url}}}", "View order")}
${text("The refund goes back to Visa ending in 4242. It usually shows on your statement within 5 to 10 business days.", { marginBottom: 24 })}
${fallback("{{{order_url}}}")}
${footer()}`,
	});
}

function storeCreditHtml(origin: string): string {
	return acmeEmail({
		title: "You have Acme store credit",
		preview: "Your store credit is ready to use on your next order.",
		body: `${logo(origin)}
${heading("Your store credit is ready")}
${lead(`Hi ${v("first_name")}, we've added store credit to your account for your return on order #${v("order_number")}. It applies automatically at checkout.`)}
${offer({
	amount: v("credit_amount"),
	label: "Acme store credit",
	expires: `Use it by ${v("credit_expiry")}`,
})}
${button("{{{shop_url}}}", "Start shopping")}
${text("Credit can be used across several orders until the balance runs out. It can't be exchanged for cash.", { marginBottom: 24 })}
${fallback("{{{shop_url}}}")}
${footer()}`,
	});
}

function paymentDisputedHtml(origin: string): string {
	return acmeEmail({
		title: "A payment to Acme was disputed",
		preview: "Your bank opened a dispute on a recent charge.",
		body: `${logo(origin)}
${heading("A payment was disputed")}
${lead(`Hi ${v("first_name")}, your bank told us you've disputed a charge from Acme. If this was a mistake, you can withdraw the dispute with your bank. If not, we'd like to help sort it out.`)}
${details([
	{ label: "Invoice", value: v("invoice_number") },
	{ label: "Charged on", value: "Oct 1, 2026" },
	{ label: "Reason given", value: "Unrecognized charge" },
	{ label: "Amount", value: "$64.80", strong: true },
])}
${step(1, "Check the charge", "It appears on statements as ACME.EXAMPLE PRO and covers your Pro plan for October.")}
${step(2, "Talk to us first", "Reply to this email. If something was wrong, we'll refund you directly, which is faster than a dispute.")}
${button("{{{billing_url}}}", "Review billing history")}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}

function giftCardReceiptHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme gift card receipt",
		preview: "Your gift card has been sent.",
		body: `${logo(origin)}
${heading("Your gift card is on its way")}
${lead(`Thanks, ${v("first_name")}. We've emailed your gift card to ${v("recipient_name")}. It arrives on ${v("send_date")} with your message.`)}
${details([
	{
		label: "Acme gift card",
		note: `To ${v("recipient_name")}`,
		value: "$100.00",
	},
	{ label: "Delivery", value: "Email" },
	{ label: "Total paid", value: "$100.00", strong: true },
])}
${button("{{{order_url}}}", "View gift card")}
${text("Gift cards never expire and can be used on anything in the Acme store. Paid with Visa ending in 4242.", { marginBottom: 24 })}
${fallback("{{{order_url}}}")}
${footer()}`,
	});
}

export const receiptsTemplates: EmailTemplateExample[] = [
	{
		id: "acme-invoice-net-30",
		name: "Invoice (net 30)",
		slug: "acme-invoice-net-30",
		category: "receipts",
		description:
			"Acme invoice with line items and a 30-day due date for bank transfer.",
		html: invoiceNet30Html,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "invoice_number", type: "string", defaultValue: "INV-2026-0418" },
			{ name: "company_name", type: "string", defaultValue: "Northwind" },
			{ name: "due_date", type: "string", defaultValue: "Nov 13, 2026" },
			{ name: "invoice_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-annual-receipt",
		name: "Annual receipt",
		slug: "acme-annual-receipt",
		category: "receipts",
		description:
			"Acme receipt for a yearly plan renewal with the annual savings.",
		html: annualReceiptHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "period",
				type: "string",
				defaultValue: "Oct 14, 2026 to Oct 13, 2027",
			},
			{ name: "invoice_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-credit-applied",
		name: "Credit applied",
		slug: "acme-credit-applied",
		category: "receipts",
		description:
			"Acme notice that an account credit was added and will reduce the next invoice.",
		html: creditAppliedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "credit_amount", type: "string", defaultValue: "$24.00" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-partial-refund",
		name: "Partial refund",
		slug: "acme-partial-refund",
		category: "receipts",
		description: "Acme confirmation that part of an order was refunded.",
		html: partialRefundHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "order_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-store-credit-issued",
		name: "Store credit issued",
		slug: "acme-store-credit-issued",
		category: "receipts",
		description:
			"Acme store credit issued for a return, with its balance and expiry.",
		html: storeCreditHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "credit_amount", type: "string", defaultValue: "$89.00" },
			{ name: "credit_expiry", type: "string", defaultValue: "Oct 14, 2027" },
			{ name: "shop_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-payment-disputed",
		name: "Payment disputed",
		slug: "acme-payment-disputed",
		category: "receipts",
		description:
			"Acme notice of a chargeback on a charge, asking the customer to reach out first.",
		html: paymentDisputedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "invoice_number", type: "string", defaultValue: "INV-2026-0391" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-gift-card-receipt",
		name: "Gift card receipt",
		slug: "acme-gift-card-receipt",
		category: "receipts",
		description: "Acme receipt for a gift card purchase with delivery details.",
		html: giftCardReceiptHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "recipient_name", type: "string", defaultValue: "Sam" },
			{ name: "send_date", type: "string", defaultValue: "Oct 18, 2026" },
			{ name: "order_url", type: "string", defaultValue: null },
		],
	},
];
