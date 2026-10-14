import {
	acmeEmail,
	button,
	code,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	logo,
	text,
} from "./theme";

export function acmeSequenceCliHtml(origin: string): string {
	return acmeEmail({
		title: "Run Acme from your terminal",
		preview:
			"Install the Acme CLI to add sites, send events, and pull reports.",
		body: `${logo(origin)}
${eyebrow("Getting started · 3 of 4")}
${heading("Run Acme from your terminal")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, everything in the dashboard also works from the Acme CLI, so you can script it, run it in CI, or hand it to your coding agent.`)}
${text("Install it and sign in:", { marginBottom: 12 })}
${code(["npm install -g @acme/cli", "acme login"], 24)}
${text("Then try a few commands:", { marginBottom: 12 })}
${code([
	"# Add a site and print its tracking script",
	"acme sites add example.com",
	"",
	"# Send a test event",
	"acme events send signup --prop plan=pro",
	"",
	"# Last 7 days of traffic as JSON",
	"acme report --range 7d --json",
])}
${text("Running in CI? Set <code>ACME_API_KEY</code> instead of running <code>acme login</code>.", { marginBottom: 28 })}
${button("{{{docs_url}}}", "Read the CLI docs")}
${fallback("{{{docs_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}
