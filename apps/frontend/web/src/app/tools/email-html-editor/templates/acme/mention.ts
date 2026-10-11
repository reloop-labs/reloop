import {
	acme,
	acmeEmail,
	block,
	button,
	fallback,
	footer,
	heading,
	lead,
	logo,
	text,
} from "./theme";

export function acmeMentionHtml(origin: string): string {
	const quote = block(
		`<p style="margin:0;font-size:16px;line-height:26px;color:${acme.ink};font-family:${acme.font}">@<span data-variable="first_name">{{{first_name}}}</span> can you check why signups dipped on Tuesday? It lines up with the deploy.</p>`,
		`padding:20px 24px;border-left:3px solid ${acme.brand}`,
		`background-color:${acme.tint};margin:0 0 28px 0`,
	);

	return acmeEmail({
		title: "You were mentioned in Acme",
		preview: "A teammate mentioned you in a comment.",
		body: `${logo(origin)}
${heading(`<span data-variable="commenter_name">{{{commenter_name}}}</span> mentioned you`)}
${lead(`<span data-variable="commenter_name">{{{commenter_name}}}</span> mentioned you in a comment on the Pricing page report.`)}
${quote}
${button("{{{comment_url}}}", "Reply to comment")}
${text(`You're getting this because someone mentioned you in Acme.`, { marginBottom: 24 })}
${fallback("{{{comment_url}}}")}
${footer()}`,
	});
}
