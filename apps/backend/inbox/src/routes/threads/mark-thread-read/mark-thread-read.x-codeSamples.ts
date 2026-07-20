export const markThreadReadXCodeSamples = [
	{
		id: "node",
		lang: "javascript",
		label: "Node.js",
		source: `import { Reloop } from "reloop-email";

const reloop = new Reloop({ apiKey: "rl_123456789" });

const { thread, threadError } = await reloop.inbox.threads.setRead("thr_123456789", {
  isRead: true,
});
if (threadError) throw threadError;`,
	},
	{
		id: "curl",
		lang: "bash",
		label: "cURL",
		source: `curl -X PATCH https://reloop.sh/api/inbox/v1/threads/thr_123456789/read \
  -H "x-api-key: rl_123456789" \
  -H "Content-Type: application/json" \
  -d '{"isRead":true}'`,
	},
	{
		id: "python",
		lang: "python",
		label: "Python",
		source: `# Inbox SDK support coming soon — use the REST API`,
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
