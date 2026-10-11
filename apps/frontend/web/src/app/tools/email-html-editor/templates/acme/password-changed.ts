import {
	acme,
	acmeEmail,
	button,
	fallback,
	footer,
	heading,
	lead,
	logo,
	text,
} from "./theme";

export function acmePasswordChangedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme password was changed",
		preview:
			"Your password was just changed. If this wasn't you, reset it now.",
		body: `${logo(origin)}
${heading("Your password was changed")}
${lead(`The password for <span data-variable="email">{{{email}}}</span> was changed on Oct 11, 2026 at 9:42 AM UTC. If you made this change, there's nothing else to do.`)}
${text(`Didn't change your password? Reset it now and review your recent activity.`, { color: acme.ink, marginBottom: 16 })}
${button("{{{reset_url}}}", "Reset password")}
${fallback("{{{reset_url}}}")}
${footer()}`,
	});
}
