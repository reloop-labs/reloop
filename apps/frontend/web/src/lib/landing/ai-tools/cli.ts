import type { FaqEntry } from "@reloop/web/lib/schema";

/**
 * Reloop CLI marketing content for /features/cli.
 * Commands follow docs/content/docs/integrations/ai-tools/cli-agents.mdx;
 * don't add commands that aren't documented there.
 */

export const CLI_PAGE_PATH = "/features/cli";

export const CLI_DOCS_HREF = "/docs/integrations/ai-tools/cli-agents";

export const CLI_INIT_COMMAND = "npx -y reloop-cli init --all --browser";

export const CLI_SKILL_COMMAND = "npx skills add reloop/reloop-cli";

export const CLI_SEND_COMMAND = `reloop emails send \\
  --from "you@yourdomain.com" \\
  --to "user@example.com" \\
  --subject "Hello from Reloop" \\
  --text "It works."`;

export const cliQuickstart = [
	{
		title: "Install and sign in",
		body: "Opens your browser to authorize your workspace. No API key to paste.",
		code: CLI_INIT_COMMAND,
	},
	{
		title: "Teach your agent the CLI",
		body: "Adds the Reloop skill to Claude Code, Codex and other skill-aware agents.",
		code: CLI_SKILL_COMMAND,
	},
	{
		title: "Send your first email",
		body: "Every command takes --json for machine-readable output in scripts and agents.",
		code: CLI_SEND_COMMAND,
	},
];

export type CliExample = {
	id: string;
	title: string;
	body: string;
	code: string;
	lang?: string;
	/** Header label above the code block */
	path?: string;
};

export const cliExamples: CliExample[] = [
	{
		id: "json",
		title: "JSON output for agents",
		body: "Add --json to any command. Output goes to stdout with no spinners, exit codes are 0 for success and 1 for errors, and every error has a message and a code.",
		code: `{
  "error": {
    "message": "No API key found",
    "code": "auth_error"
  }
}`,
		lang: "json",
		path: "stdout",
	},
	{
		id: "stdin",
		title: "Pipe content from stdin",
		body: "Pass - to any file flag to read from stdin. Works with --text-file, --html-file and --file.",
		code: `echo "Your order has shipped." | reloop emails send \\
  --from "Acme <onboarding@example.com>" \\
  --to delivered@example.com \\
  --subject "Order update" \\
  --text-file -`,
	},
	{
		id: "batch",
		title: "Batch sending",
		body: "Send up to 100 emails in one request from a JSON file or a pipe.",
		code: "cat emails.json | reloop emails batch --file -",
	},
	{
		id: "idempotency",
		title: "Safe retries",
		body: "Retry a failed send with the same --idempotency-key and Reloop won't deliver it twice. Supported on emails send and emails batch.",
		code: `reloop emails send \\
  --from "Acme <onboarding@example.com>" \\
  --to delivered@example.com \\
  --subject "Welcome" \\
  --text "Hello!" \\
  --idempotency-key "welcome-user-123"`,
	},
	{
		id: "scheduling",
		title: "Scheduling",
		body: "Schedule with --scheduled-at, then cancel or reschedule by id.",
		code: `reloop emails send \\
  --from "Acme <onboarding@example.com>" \\
  --to delivered@example.com \\
  --subject "Your trial ends soon" \\
  --text "Your free trial expires in 3 days." \\
  --scheduled-at "tomorrow at 9am ET"

reloop emails cancel <id>
reloop emails update <id> --scheduled-at <datetime>`,
	},
	{
		id: "receiving",
		title: "Read inbound email",
		body: "Stream new inbound email as JSON from a long-running process, or fetch one by id. Needs a verified domain with receiving enabled.",
		code: `reloop emails receiving listen --json

reloop emails receiving get <email-id>`,
	},
	{
		id: "webhooks",
		title: "Webhooks in your terminal",
		body: "Subscribe to webhook events and stream them to your terminal, or forward them to a local server. The webhook is removed when you disconnect.",
		code: `reloop webhooks listen \\
  --url https://hostname.tailnet-name.ts.net \\
  --events email.delivered email.bounced email.received

reloop webhooks listen \\
  --url https://hostname.tailnet-name.ts.net \\
  --forward-to http://localhost:4321/api/webhook`,
	},
];

export const cliFaq: FaqEntry[] = [
	{
		question: "How do I install the Reloop CLI?",
		answer: `Run ${CLI_INIT_COMMAND}. It sets up the CLI and opens your browser so you can authorize your workspace.`,
	},
	{
		question: "How do AI agents use the CLI?",
		answer: `Install the agent skill with ${CLI_SKILL_COMMAND} so Claude Code, Codex and other skill-aware agents know the commands. Agents pass --json to get machine-readable output, exit code 0 on success and 1 on errors, and errors with a message and a code.`,
	},
	{
		question: "Can I send email in bulk?",
		answer:
			"Yes. reloop emails batch sends up to 100 emails in a single request. Pass a JSON file, or use --file - to read it from stdin.",
	},
	{
		question: "How do I avoid duplicate sends when retrying?",
		answer:
			"Pass --idempotency-key with a stable value, such as welcome-user-123. Retrying with the same key won't send the email again. It works on emails send and emails batch.",
	},
	{
		question: "Can the CLI receive email?",
		answer:
			"Yes. reloop emails receiving listen --json streams new inbound email, and reloop emails receiving get fetches one by id. You need a verified domain with receiving enabled.",
	},
	{
		question: "How do I test webhooks locally?",
		answer:
			"Run reloop webhooks listen with a public --url (Tailscale Funnel, ngrok or similar) and the events you want. Add --forward-to to send them to a local server. The webhook is removed when you press Ctrl+C.",
	},
];
