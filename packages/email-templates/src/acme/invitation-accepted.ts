import {
	acmeEmail,
	button,
	details,
	fallback,
	footer,
	heading,
	lead,
	logo,
} from "./theme";

export function acmeInvitationAcceptedHtml(origin: string): string {
	return acmeEmail({
		title: "A teammate joined your Acme workspace",
		preview: "Your invitation was accepted.",
		body: `${logo(origin)}
${heading(`<span data-variable="invitee_name">{{{invitee_name}}}</span> joined your workspace`)}
${lead(`<span data-variable="invitee_name">{{{invitee_name}}}</span> accepted your invitation and now has access to <span data-variable="workspace_name">{{{workspace_name}}}</span>.`)}
${details([
	{ label: "Email", value: "maya@example.com" },
	{ label: "Role", value: "Editor" },
	{ label: "Joined", value: "Oct 11, 2026" },
])}
${button("{{{members_url}}}", "Manage members")}
${fallback("{{{members_url}}}")}
${footer()}`,
	});
}
