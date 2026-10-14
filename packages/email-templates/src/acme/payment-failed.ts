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

export function acmePaymentFailedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme payment didn't go through",
		preview: "Update your payment method to keep your workspace running.",
		body: `${logo(origin)}
${heading("Your payment didn't go through")}
${lead(`We couldn't charge your card for <span data-variable="workspace_name">{{{workspace_name}}}</span>. Update your payment method to keep collecting events without interruption.`)}
${details([
	{
		label: "Amount due",
		value: `<span data-variable="amount_due">{{{amount_due}}}</span>`,
	},
	{ label: "Payment method", value: "Visa ending in 4242" },
	{ label: "Next attempt", value: "Oct 14, 2026" },
])}
${button("{{{billing_url}}}", "Update payment method")}
${text("We'll retry automatically on Oct 14 and Oct 18. If both attempts fail, your workspace pauses collection until billing is updated. Your existing data stays safe.", { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}
