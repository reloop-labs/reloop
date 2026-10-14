import {
	acme,
	acmeEmail,
	button,
	code,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	link,
	logo,
	step,
	text,
} from "./theme";

export function acmeSequenceAiHtml(origin: string): string {
	return acmeEmail({
		title: "Let your coding agent set up Acme",
		preview:
			"Give Claude Code, Cursor, or Copilot our docs and let it add tracking for you.",
		body: `${logo(origin)}
${eyebrow("Getting started · 4 of 4")}
${heading("Let your coding agent set up Acme")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, using Claude Code, Cursor, or Copilot? Give it Acme's docs and it can install tracking and add your custom events for you.`, 32)}
${step(1, "Point your agent at our docs", `${link(`https://${acme.domain}/llms.txt`, `${acme.domain}/llms.txt`)} has every guide in one file written for LLMs.`)}
${step(2, "Paste this prompt", "Run it from the root of your app.")}
${code([
	`Add Acme analytics to this app using https://${acme.domain}/llms.txt. Track signups and checkouts as custom events, and use ACME_API_KEY from the environment.`,
])}
${step(3, "Check your first events", "Ask your agent to confirm through the Acme MCP server, or run <code>acme events tail</code>.")}
${text("That's the last of our getting-started emails. Reply anytime. We read every one.", { marginBottom: 28 })}
${button("{{{dashboard_url}}}", "Open your dashboard")}
${fallback("{{{dashboard_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}
