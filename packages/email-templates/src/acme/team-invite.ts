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

export function acmeTeamInviteHtml(origin: string): string {
	const workspace = block(
		`<p style="margin:0 0 2px 0;font-size:17px;line-height:26px;font-weight:500;color:${acme.ink};font-family:${acme.font}"><span data-variable="workspace_name">{{{workspace_name}}}</span></p>
<p style="margin:0;font-size:15px;line-height:24px;color:${acme.body};font-family:${acme.font}">12 members · 4 websites · You'll join as an Editor</p>`,
		"padding:20px 24px",
		`background-color:${acme.tint};margin:0 0 28px 0`,
	);

	return acmeEmail({
		title: "You've been invited to Acme",
		preview: "Your team is waiting. Accept the invite to start collaborating.",
		body: `${logo(origin)}
${heading(`<span data-variable="inviter_name">{{{inviter_name}}}</span> invited you to Acme`)}
${lead("Join the workspace to see your team's websites, dashboards, and reports in one place.")}
${workspace}
${button("{{{invite_url}}}", "Accept invitation")}
${text("This invitation expires in 7 days. Not expecting it? You can ignore this email and nothing will change.", { marginBottom: 24 })}
${fallback("{{{invite_url}}}")}
${footer()}`,
	});
}
