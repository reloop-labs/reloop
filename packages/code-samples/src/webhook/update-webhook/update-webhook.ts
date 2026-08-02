import type { CodeSample } from "../../types";

export const updateWebhookXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { webhook, webhookError } = await reloop.webhook.update("wh_123456789", {
  status: "paused",
});
if (webhookError) throw webhookError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/webhook/v1/wh_123456789 \\
  -H "x-api-key: rl_123456789" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"paused"}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.webhook.update("wh_123456789", {
  "status": "paused",
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

$webhook = $reloop->webhook->update('wh_123456789', [
    'status' => 'paused',
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

UpdateWebhookParams params = new UpdateWebhookParams();
params.status = "paused";
var webhook = reloop.webhook.update("wh_123456789", params);`,
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
