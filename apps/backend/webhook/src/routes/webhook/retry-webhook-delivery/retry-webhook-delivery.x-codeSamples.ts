export const retryWebhookDeliveryXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { response, error } = await reloop.webhook.retryDelivery("del_123456789");
if (error) throw error;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/webhook/deliveries/del_123456789/retry \\
  -H "x-api-key: rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `# Webhook SDK support coming soon`,
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
