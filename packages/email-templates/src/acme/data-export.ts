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

export function acmeDataExportHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme data export is ready",
		preview: "The export you requested is ready to download.",
		body: `${logo(origin)}
${heading("Your data export is ready")}
${lead(`The export you requested for <span data-variable="workspace_name">{{{workspace_name}}}</span> is ready to download.`)}
${details([
	{ label: "File", value: "acme-studio-export.zip" },
	{ label: "Size", value: "24.8 MB" },
	{ label: "Includes", value: "Events, reports, settings" },
	{ label: "Link expires", value: "Oct 18, 2026" },
])}
${button("{{{download_url}}}", "Download export")}
${text("For your security, only workspace admins can open this link.", { marginBottom: 24 })}
${fallback("{{{download_url}}}")}
${footer()}`,
	});
}
