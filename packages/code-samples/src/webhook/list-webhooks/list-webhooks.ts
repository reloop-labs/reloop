import type { CodeSample } from "../../types";

export const listWebhooksXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { webhooks, webhookError } = await reloop.webhook.list({
  page: 1,
  limit: 10,
  status: "active",
});
if (webhookError) throw webhookError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X GET "https://reloop.sh/api/webhook/v1/?page=1&limit=10&status=active" \\
  -H "x-api-key: rl_123456789"`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.webhook.list({
  "page": 1,
  "limit": 10,
  "status": "active",
})
if result.webhook_error:
    raise result.webhook_error`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\\Reloop;

$reloop = Reloop::client('rl_123456789');

$webhooks = $reloop->webhook->list([
    'page' => 1,
    'limit' => 10,
    'status' => 'active',
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

ListWebhooksParams params = new ListWebhooksParams();
params.page = 1;
params.limit = 10;
params.status = "active";
var webhooks = reloop.webhook.list(params);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: "// Webhook SDK support coming soon",
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: "// Webhook SDK support coming soon",
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: "// Webhook SDK support coming soon",
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: "# Webhook SDK support coming soon",
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: "# Webhook SDK support coming soon",
	},
];
