import type { CodeSample } from "../../../types";

export const createMailboxXCodeSamples: CodeSample[] = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { mailbox, mailboxError } = await reloop.inbox.mailboxes.create({
  domainId: "dom_123456789",
  email: "support@example.com",
  displayName: "Support",
});
if (mailboxError) throw mailboxError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/inbox/v1/mailboxes/create \
  -H "x-api-key: rl_123456789" \
  -H "Content-Type: application/json" \
  -d '{"domainId":"dom_123456789","email":"support@example.com","displayName":"Support"}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.inbox.mailboxes.create({
  "domainId": "dom_123456789",
  "email": "support@example.com",
  "displayName": "Support",
})
if result.mailbox_error:
    raise result.mailbox_error`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `<?php

require 'vendor/autoload.php';

use ReloopReloop;

$reloop = Reloop::client('rl_123456789');

$mailbox = $reloop->inbox->mailboxes->create([
    'domainId' => 'dom_123456789',
    'email' => 'support@example.com',
    'displayName' => 'Support',
]);`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `import sh.reloop.ReloopClient;
ReloopClient reloop = new ReloopClient("rl_123456789");

CreateMailboxParams params = new CreateMailboxParams();
params.domainId = "dom_123456789";
params.email = "support@example.com";
params.displayName = "Support";
var mailbox = reloop.inbox.mailboxes.create(params);`,
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
