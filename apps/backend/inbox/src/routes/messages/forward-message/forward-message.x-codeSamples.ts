export const forwardMessageXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { message, messageError } = await reloop.inbox.messages.forward("msg_123456789", {
  to: "colleague@example.com",
  html: "<p>See the thread below.</p>",
});
if (messageError) throw messageError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X POST https://reloop.sh/api/inbox/v1/messages/msg_123456789/forward \
  -H "x-api-key: rl_123456789" \
  -H "Content-Type: application/json" \
  -d '{"to":"colleague@example.com","html":"<p>See the thread below.</p>"}'`,
	},
				{
		id: "python",
		lang: "python",
		label: "Python",
		source: `from reloop_email import Reloop

reloop = Reloop(api_key="rl_123456789")

result = reloop.inbox.messages.forward("msg_123456789", {
  "to": "colleague@example.com",
  "html": "<p>See the thread below.</p>",
})
if result.message_error:
    raise result.message_error`,
	},
	{
		id: "php",
		lang: "php",
		label: "PHP",
		source: `// Inbox SDK support coming soon — use the REST API`,
	},
	{
		id: "java",
		lang: "java",
		label: "Java",
		source: `// Inbox SDK support coming soon — use the REST API`,
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
