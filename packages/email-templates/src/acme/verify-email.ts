import {
	acmeEmail,
	button,
	fallback,
	footer,
	heading,
	lead,
	logo,
	text,
} from "./theme";

export function acmeVerifyEmailHtml(origin: string): string {
	return acmeEmail({
		title: "Verify your Acme email address",
		preview: "Confirm your email address to finish setting up your account.",
		body: `${logo(origin)}
${heading("Verify your email address")}
${lead(`Confirm <span data-variable="email">{{{email}}}</span> so we know it's really you. Verifying keeps your account secure and makes sure you get important updates.`)}
${button("{{{verify_url}}}", "Verify email")}
${text(`This link expires in 24 hours. If you didn't create an Acme account, you can ignore this email.`, { marginBottom: 24 })}
${fallback("{{{verify_url}}}")}
${footer()}`,
	});
}
