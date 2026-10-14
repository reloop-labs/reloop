import {
	acmeEmail,
	button,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	logo,
	step,
	text,
} from "./theme";

export function acmeSequenceWelcomeHtml(origin: string): string {
	return acmeEmail({
		title: "Welcome to Acme",
		preview:
			"Pick how you want to work: your AI assistant, your terminal, or the dashboard.",
		body: `${logo(origin)}
${eyebrow("Getting started · 1 of 4")}
${heading("Welcome to Acme")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, your workspace is ready. Acme works wherever you do. Over the next few days we'll send a short guide for each way in.`, 32)}
${step(1, "From your AI assistant", "Connect the Acme MCP server and ask Claude, Cursor, or ChatGPT about your traffic in plain English.")}
${step(2, "From your terminal", "Install the Acme CLI to add sites, send events, and pull reports from scripts and CI.")}
${step(3, "From the dashboard", "Add your website, copy the tracking script, and watch your first visit come in.")}
${text("Already know which one you want? Start in the dashboard. Every option is one click from there.", { marginBottom: 28 })}
${button("{{{dashboard_url}}}", "Open your dashboard")}
${text("Stuck on anything? Reply to this email. It goes to a real person.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}
