import {
	acme,
	acmeEmail,
	block,
	button,
	footer,
	heading,
	lead,
	link,
	logo,
	text,
} from "./theme";

export function acmeSignInCodeHtml(origin: string): string {
	const code = block(
		`<p style="margin:0;font-size:34px;line-height:40px;font-weight:500;letter-spacing:0.28em;color:${acme.ink};font-family:${acme.font}"><span data-variable="otp_code">{{{otp_code}}}</span></p>`,
		"padding:24px 28px",
		`background-color:${acme.tint};margin:0 0 16px 0`,
	);

	return acmeEmail({
		title: "Your Acme sign-in code",
		preview: "Your sign-in code is inside. It expires in 10 minutes.",
		body: `${logo(origin)}
${heading("Your sign-in code")}
${lead("Enter this code in the Acme window you just opened to finish signing in.")}
${code}
${text("The code expires in 10 minutes. Never share it with anyone, including Acme support.", { marginBottom: 28 })}
${text("Prefer one click? Sign in with a magic link instead.", { color: acme.ink, marginBottom: 16 })}
${button("{{{magic_link_url}}}", "Sign in to Acme")}
${text(`Didn't try to sign in? You can ignore this email. If it keeps happening, ${link("#", "secure your account")}.`, { marginBottom: 32 })}
${footer()}`,
	});
}
