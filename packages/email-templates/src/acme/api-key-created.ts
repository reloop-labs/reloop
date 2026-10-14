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

export function acmeApiKeyCreatedHtml(origin: string): string {
	return acmeEmail({
		title: "A new Acme API key was created",
		preview: "A new API key was created in your workspace.",
		body: `${logo(origin)}
${heading("A new API key was created")}
${lead(`<span data-variable="creator_name">{{{creator_name}}}</span> created an API key in <span data-variable="workspace_name">{{{workspace_name}}}</span>.`)}
${details([
	{ label: "Name", value: "Production server" },
	{ label: "Key", value: "ak_live_••••7f3a" },
	{ label: "Permissions", value: "Full access" },
	{ label: "Created", value: "Oct 11, 2026, 9:42 AM UTC" },
])}
${button("{{{api_keys_url}}}", "Review API keys")}
${text(`Don't recognize this key? Revoke it right away and rotate any secrets it may have accessed.`, { marginBottom: 24 })}
${fallback("{{{api_keys_url}}}")}
${footer()}`,
	});
}
