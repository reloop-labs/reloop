import {
	acmeEmail,
	button,
	fallback,
	footer,
	heading,
	lead,
	logo,
	offer,
	step,
	text,
} from "./theme";

export function acmeOfferWinBackHtml(origin: string): string {
	return acmeEmail({
		title: "Come back to Acme for 30% off",
		preview: "A lot has changed since you left. Here's 30% off for 3 months.",
		body: `${logo(origin)}
${heading("We've been busy since you left")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, Acme has changed a lot in the last few months. Here's what's new, and 30% off if you'd like to give it another try.`, 32)}
${step(1, "MCP server", "Ask Claude, Cursor, or ChatGPT about your traffic, right from your AI assistant.")}
${step(2, "Acme CLI", "Add sites, send events, and pull reports from your terminal and CI.")}
${step(3, "AI insights", "A weekly summary of what changed in your traffic and why.")}
${offer({
	amount: "30% off",
	label: "any plan for 3 months",
	code: `<span data-variable="coupon_code">{{{coupon_code}}}</span>`,
	expires: `Offer ends <span data-variable="offer_expiry">{{{offer_expiry}}}</span>`,
})}
${button("{{{reactivate_url}}}", "Reactivate my workspace")}
${text("Your websites and settings are still here, ready when you are.", { marginBottom: 24 })}
${fallback("{{{reactivate_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}
