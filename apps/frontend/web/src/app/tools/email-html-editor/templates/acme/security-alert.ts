import {
	acmeEmail,
	button,
	details,
	footer,
	heading,
	lead,
	link,
	logo,
	text,
} from "./theme";

export function acmeSecurityAlertHtml(origin: string): string {
	return acmeEmail({
		title: "New sign-in to your Acme account",
		preview: "We noticed a sign-in from a new device. Was this you?",
		body: `${logo(origin)}
${heading("New sign-in to your account")}
${lead(`Your Acme account was just accessed from a device we haven't seen before, <span data-variable="first_name">{{{first_name}}}</span>. If this was you, there's nothing to do.`)}
${details([
	{ label: "Device", value: "Chrome on macOS" },
	{ label: "Location", value: "Toronto, Canada" },
	{ label: "IP address", value: "192.0.2.42" },
	{ label: "Time", value: "Oct 11, 2026, 8:14 AM EDT" },
])}
${button("{{{security_url}}}", "Review account activity")}
${text(`Didn't sign in? ${link("{{{security_url}}}", "Secure your account")} right away. We'll sign out every device and help you reset your password.`, { marginBottom: 32 })}
${footer()}`,
	});
}
