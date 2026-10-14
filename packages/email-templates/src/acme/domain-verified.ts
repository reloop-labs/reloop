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

export function acmeDomainVerifiedHtml(origin: string): string {
	return acmeEmail({
		title: "Your domain is verified",
		preview: "Your domain is verified and ready to collect events.",
		body: `${logo(origin)}
${heading("Your domain is verified")}
${lead(`<span data-variable="domain">{{{domain}}}</span> is verified and ready. Acme can now collect events from this domain.`)}
${details([
	{
		label: "Domain",
		value: `<span data-variable="domain">{{{domain}}}</span>`,
	},
	{ label: "DNS record", value: "TXT · acme-verify" },
	{ label: "Verified", value: "Oct 11, 2026" },
])}
${button("{{{dashboard_url}}}", "Open dashboard")}
${text("Next, install the tracking script on your site to start seeing visits.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer()}`,
	});
}
