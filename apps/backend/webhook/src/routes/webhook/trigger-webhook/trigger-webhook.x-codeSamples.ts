export const triggerWebhookXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { webhook, webhookError } = await reloop.webhook.trigger({
  event: "domain.created",
  payload: { domainId: "dom_123456789" },
});
if (webhookError) throw webhookError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/webhook/v1/trigger \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"event":"domain.created","payload":{"domainId":"dom_123456789"}}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.webhook.trigger({
  "event": "domain.created",
  "payload": {
    "domainId": "dom_123456789",
  },
})
if result.webhook_error:
    raise result.webhook_error`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `// Webhook SDK support coming soon`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `// Webhook SDK support coming soon`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `// Webhook SDK support coming soon`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `// Webhook SDK support coming soon`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `// Webhook SDK support coming soon`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `# Webhook SDK support coming soon`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `# Webhook SDK support coming soon`,
	},
];
