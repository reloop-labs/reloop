import type { CodeSample } from "../../../types";

export const sendMessageXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { message, messageError } = await reloop.inbox.messages.send({
  mailboxId: "mbx_123456789",
  to: "user@example.com",
  subject: "Hello from Reloop Inbox",
  html: "<p>Thanks for reaching out.</p>",
});
if (messageError) throw messageError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/inbox/v1/messages/send \
  -H "x-api-key: rl_123456789" \
  -H "Content-Type: application/json" \
  -d '{"mailboxId":"mbx_123456789","to":"user@example.com","subject":"Hello from Reloop Inbox","html":"<p>Thanks for reaching out.</p>"}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.inbox.messages.send({
  "mailboxId": "mbx_123456789",
  "to": "user@example.com",
  "subject": "Hello from Reloop Inbox",
  "html": "<p>Thanks for reaching out.</p>",
})
if result.message_error:
    raise result.message_error`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use ReloopReloop;

$reloop = Reloop::client('rl_123456789');

$message = $reloop->inbox->messages->send([
    'mailboxId' => 'mbx_123456789',
    'to' => 'user@example.com',
    'subject' => 'Hello from Reloop Inbox',
    'html' => '<p>Thanks for reaching out.</p>',
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

SendMessageParams params = new SendMessageParams();
params.mailboxId = "mbx_123456789";
params.to = "user@example.com";
params.subject = "Hello from Reloop Inbox";
params.html = "<p>Thanks for reaching out.</p>";
var message = reloop.inbox.messages.send(params);`,
	},
	{
		id: "dotnet",
		lang: "csharp",
		label: ".NET",
		source: "// Inbox SDK support coming soon — use the REST API",
	},
	{
		id: "go",
		lang: "go",
		label: "Go",
		source: "// Inbox SDK support coming soon — use the REST API",
	},
	{
		id: "rust",
		lang: "rust",
		label: "Rust",
		source: "// Inbox SDK support coming soon — use the REST API",
	},
	{
		id: "ruby",
		lang: "ruby",
		label: "Ruby",
		source: "# Inbox SDK support coming soon — use the REST API",
	},
	{
		id: "elixir",
		lang: "elixir",
		label: "Elixir",
		source: "# Inbox SDK support coming soon — use the REST API",
	},
];
