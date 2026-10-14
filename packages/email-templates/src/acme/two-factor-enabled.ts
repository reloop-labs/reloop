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

export function acmeTwoFactorEnabledHtml(origin: string): string {
	return acmeEmail({
		title: "Two-factor authentication is on",
		preview: "Your Acme account now requires a second step to sign in.",
		body: `${logo(origin)}
${heading("Two-factor authentication is on")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, your account now asks for a code from your authenticator app each time you sign in.`)}
${details([
	{ label: "Method", value: "Authenticator app" },
	{ label: "Backup codes", value: "10 remaining" },
	{ label: "Turned on", value: "Oct 11, 2026" },
])}
${button("{{{security_url}}}", "View security settings")}
${text(`Store your backup codes somewhere safe. You'll need one to sign in if you lose access to your authenticator app.`, { marginBottom: 24 })}
${fallback("{{{security_url}}}")}
${footer()}`,
	});
}
