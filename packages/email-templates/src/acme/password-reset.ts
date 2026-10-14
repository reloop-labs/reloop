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

export function acmePasswordResetHtml(origin: string): string {
	return acmeEmail({
		title: "Reset your Acme password",
		preview:
			"Use this link to choose a new password. It expires in 30 minutes.",
		body: `${logo(origin)}
${heading("Reset your password")}
${lead(`We received a request to reset the password for <span data-variable="email">{{{email}}}</span>. Choose a new one with the button below.`)}
${button("{{{reset_url}}}", "Reset password")}
${text("This link expires in 30 minutes and can only be used once. If you didn't ask to reset your password, you can ignore this email. Your password won't change.", { marginBottom: 24 })}
${fallback("{{{reset_url}}}")}
${footer()}`,
	});
}
