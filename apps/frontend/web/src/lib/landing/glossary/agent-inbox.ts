import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "agent-inbox",
	title: "Agent Inbox",
	description:
		"A mailbox an AI agent owns: it receives mail at its own address, gets each message as structured JSON, and replies through an API.",
	keywords: [
		"AI agent inbox",
		"agent email inbox",
		"email inbox for AI agents",
	],
	body: `An agent inbox is an email address that belongs to a piece of software rather than a person. Mail sent to it is received by an MTA, parsed into structured fields (sender, subject, thread, attachments), optionally classified against a prompt or JSON schema, and delivered to the agent as a webhook or fetched through an API. The agent answers through the same API, so the whole conversation stays in one thread.

It differs from a transactional email API, which only sends. It also differs from connecting an agent to a human's Gmail or Outlook mailbox through IMAP or a vendor API: the agent inbox is provisioned programmatically, scoped to one agent, and lives on a subdomain you control, so its reputation is separate from your people.

Good practice is to give agents a subdomain such as agent.example.com with SPF, DKIM and DMARC of its own, keep the API key in a secret manager, and route outbound drafts through human approval until you trust the agent.

In Reloop, an agent inbox is a mailbox on a verified domain. Inbound mail arrives as an email.received webhook or through the inbox API, the MCP server exposes the same inbox to Claude Code, Codex and Cursor, and plans include a set number of agent inboxes.`,
	relatedTerms: [
		{ slug: "inbound-email", title: "Inbound Email" },
		{ slug: "mcp", title: "MCP" },
		{ slug: "webhook", title: "Webhook" },
	],
	relatedFeatureHref: "/features/ai-agents",
};
