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

export function acmeEmailChangedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme email address was changed",
		preview: "Your sign-in email was changed. Review this if it wasn't you.",
		body: `${logo(origin)}
${heading("Your email address was changed")}
${lead(`Your Acme sign-in email was changed from <span data-variable="old_email">{{{old_email}}}</span> to <span data-variable="new_email">{{{new_email}}}</span>. We're sending this notice to your previous address.`)}
${details([
	{ label: "Changed on", value: "Oct 11, 2026, 9:42 AM UTC" },
	{ label: "Device", value: "Chrome on macOS" },
])}
${button("{{{security_url}}}", "Review account security")}
${text(`Didn't make this change? Secure your account right away. We'll help you get back in and restore your email address.`, { marginBottom: 24 })}
${fallback("{{{security_url}}}")}
${footer()}`,
	});
}
