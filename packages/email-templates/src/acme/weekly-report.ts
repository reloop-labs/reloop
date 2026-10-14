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

export function acmeWeeklyReportHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme weekly report",
		preview: "Visitors up 8% this week. Here's your summary.",
		body: `${logo(origin)}
${heading("Your weekly report")}
${lead(`Here's how <span data-variable="workspace_name">{{{workspace_name}}}</span> did from Oct 4 to Oct 10.`)}
${details([
	{ label: "Visitors", value: "12,480 (+8%)" },
	{ label: "Page views", value: "41,920 (+5%)" },
	{ label: "Top page", value: "/pricing" },
	{ label: "Top source", value: "Google Search" },
	{ label: "Conversions", value: "312 (+12%)", strong: true },
])}
${button("{{{report_url}}}", "View full report")}
${text(`You're receiving weekly reports for this workspace. You can change this in notification settings.`, { marginBottom: 24 })}
${fallback("{{{report_url}}}")}
${footer()}`,
	});
}
