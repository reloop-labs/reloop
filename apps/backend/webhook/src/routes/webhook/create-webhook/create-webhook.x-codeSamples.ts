export const createWebhookXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response, error } = await reloop.webhook.create({
  description: "Production webhook",
  url: "https://example.com/webhooks/reloop",
  events: ["domain.created", "domain.deleted"],
});
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/webhook/v1/ \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"description":"Production webhook","url":"https://example.com/webhooks/reloop","events":["domain.created","domain.deleted"]}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `# Webhook SDK support coming soon — use the REST API:
import httpx

httpx.post(
    "https://reloop.sh/api/webhook/v1/",
    headers={"x-api-key": "rl_123456789"},
    json={
        "description": "Production webhook",
        "url": "https://example.com/webhooks/reloop",
        "events": ["domain.created", "domain.deleted"],
    },
)`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `// Webhook SDK support coming soon — use the REST API via Guzzle`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `// Webhook SDK support coming soon — use the REST API`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `// Webhook SDK support coming soon — use the REST API`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `// Webhook SDK support coming soon — use the REST API`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `// Webhook SDK support coming soon — use the REST API`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `# Webhook SDK support coming soon — use the REST API`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `# Webhook SDK support coming soon — use the REST API`,
	},
];
