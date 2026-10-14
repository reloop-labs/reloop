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
	logo,
	step,
	text,
} from "./theme";

export function acmeSequenceMcpHtml(origin: string): string {
	return acmeEmail({
		title: "Connect Acme to your AI assistant",
		preview:
			"Add the Acme MCP server and ask your analytics questions in plain English.",
		body: `${logo(origin)}
${eyebrow("Getting started · 2 of 4")}
${heading("Connect Acme to your AI assistant")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, the Acme MCP server lets Claude, Cursor, and other AI assistants read your analytics and set things up for you. It takes about a minute.`, 32)}
${step(1, "Create an API key", "Open API keys in your dashboard and create a key with read access.")}
${step(2, "Add the server to your client", "Paste this into your MCP config and swap in your key.")}
${code(
	[
		"{",
		'  "mcpServers": {',
		'    "acme": {',
		`      "url": "https://mcp.${acme.domain}/mcp",`,
		'      "headers": { "Authorization": "Bearer YOUR_API_KEY" }',
		"    }",
		"  }",
		"}",
	],
	16,
)}
${text("Using Claude Code? It's one command:", { marginBottom: 12 })}
${code([`claude mcp add --transport http acme https://mcp.${acme.domain}/mcp`])}
${step(
	3,
	"Ask it something",
	`Try one of these to see it work:<br /><span style="color:${acme.ink}">“Which pages had the most visitors last week?”<br />“Where do people who sign up come from?”<br />“Set up a custom event for checkout.”</span>`,
)}
${button("{{{api_keys_url}}}", "Create an API key")}
${fallback("{{{api_keys_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}
