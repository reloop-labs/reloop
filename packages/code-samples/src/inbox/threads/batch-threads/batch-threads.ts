import type { CodeSample } from "../../../types";

export const batchThreadsXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { thread, threadError } = await reloop.inbox.threads.batch({
  ids: ["thr_123456789", "thr_987654321"],
  action: "archive",
});
if (threadError) throw threadError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/inbox/v1/threads/batch \
  -H "x-api-key: rl_123456789" \
  -H "Content-Type: application/json" \
  -d '{"ids":["thr_123456789","thr_987654321"],"action":"archive"}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.inbox.threads.batch({
  "ids": ["thr_123456789", "thr_987654321"],
  "action": "archive",
})
if result.thread_error:
    raise result.thread_error`,
	},
			{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use Reloop\Reloop;

$reloop = Reloop::client('rl_123456789');

$thread = $reloop->inbox->threads->batch([
    'ids' => ['thr_123456789', 'thr_987654321'],
    'action' => 'archive',
]);`,
	},
			{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

BatchThreadsParams params = new BatchThreadsParams();
params.ids = List.of("thr_123456789", "thr_987654321");
params.action = "archive";
var thread = reloop.inbox.threads.batch(params);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: `// Inbox SDK support coming soon — use the REST API`,
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: `// Inbox SDK support coming soon — use the REST API`,
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: `// Inbox SDK support coming soon — use the REST API`,
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: `# Inbox SDK support coming soon — use the REST API`,
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: `# Inbox SDK support coming soon — use the REST API`,
	},
];
