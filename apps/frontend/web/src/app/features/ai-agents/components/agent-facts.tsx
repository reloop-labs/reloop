import { planLimits } from "@reloop/pricing";
import { FaqSection } from "@reloop/web/components/faq-section";
import type { FaqEntry } from "@reloop/web/lib/schema";
import Link from "next/link";

const inboxesByPlan = `${planLimits.free.maxAgentInboxes} on Free, ${planLimits.individual.maxAgentInboxes} on Pro, ${planLimits.startup.maxAgentInboxes} on Growth`;

export const agentFaq: FaqEntry[] = [
	{
		question: "What is an agent inbox?",
		answer: `A mailbox on a domain you have verified with Reloop, such as agent@agent.example.com. Reloop receives mail for it, parses the body, headers and attachments, runs your classification prompt and JSON schema over it, and hands the result to your agent as an email.received webhook or through the inbox API. The agent replies through the same API. Plans include ${inboxesByPlan} agent inboxes.`,
	},
	{
		question: "How does my agent receive email?",
		answer:
			"Subscribe a webhook to the email.received event and Reloop posts a JSON payload with the sender, subject, thread id and message id the moment a message lands. For local development or scripts, the CLI command reloop emails receiving listen --json streams inbound mail to stdout.",
	},
	{
		question: "Which agent tools does Reloop support?",
		answer:
			"The reloop-mcp server exposes sending, inbound mail, contacts, broadcasts, domains, webhooks and templates as MCP tools for Claude Code, Codex, Cursor and Claude Desktop. The reloop-skills package installs agent skills, the CLI has a non-interactive mode, and every docs and marketing page has a markdown twin plus llms.txt and skill.md for retrieval.",
	},
	{
		question: "Can an agent send email as well as read it?",
		answer:
			"Yes. Sending uses the same REST API, SMTP relay and SDKs as any other Reloop send, with scheduling, attachments and tags. Drafts can be routed to a human in the dashboard for approval before they go out.",
	},
	{
		question: "Can I self-host the agent inbox?",
		answer:
			"Yes. The agent inbox, MCP server and inbound processing are part of the Apache 2.0 codebase (with Reloop Labs use restrictions), so a self-hosted install has the same agent features as Reloop Cloud with no license fee.",
	},
];

const facts = [
	{
		value: inboxesByPlan.replace(/ on \w+/g, ""),
		label: "Agent inboxes per plan",
		detail: "Free, Pro and Growth. Custom on Enterprise.",
	},
	{
		value: "email.received",
		label: "Inbound webhook event",
		detail: "Sender, subject, thread id and message id as JSON.",
	},
	{
		value: "11",
		label: "MCP tool groups",
		detail:
			"Emails, inbound, contacts, broadcasts, domains, webhooks and more.",
	},
	{
		value: "9 SDKs + CLI",
		label: "Ways to call the API",
		detail: "Node.js, Python, PHP, Ruby, Go, Rust, Java, .NET, Elixir.",
	},
];

const commands = [
	{
		title: "Give Claude Code the Reloop MCP server",
		code: "claude mcp add reloop -e RELOOP_API_KEY=rl_xxxxxxxxx -- npx -y reloop-mcp",
		href: "/docs/integrations/ai-tools/mcp-server",
		linkLabel: "MCP server guide",
	},
	{
		title: "Install the agent skills",
		code: "npx skills add reloop/reloop-skills",
		href: "/docs/integrations/ai-tools/openclaw-guide",
		linkLabel: "Give an agent an inbox",
	},
	{
		title: "Stream inbound mail to a script",
		code: "reloop emails receiving listen --json",
		href: "/docs/integrations/ai-tools/cli-agents",
		linkLabel: "CLI for agents",
	},
];

const inboundPayload = `{
  "email_id": "in_…",
  "mailbox_id": "mb_…",
  "from": "customer@example.com",
  "subject": "Order #4821 never arrived",
  "thread_id": "thr_…",
  "has_attachments": false,
  "is_spam": false,
  "status": "received"
}`;

const reading = [
	{ href: "/use-cases/ai-agent-inbox", label: "Use case: AI agent inbox" },
	{ href: "/docs/learn/agent-inbox", label: "Docs: agent inbox" },
	{ href: "/docs/webhooks/event-types", label: "Docs: webhook events" },
	{
		href: "/blog/build-ai-agent-sends-emails",
		label: "Build an agent that sends email",
	},
	{
		href: "/blog/email-infrastructure-for-ai-agents",
		label: "An agent that reads and replies",
	},
	{ href: "/glossary/agent-inbox", label: "Glossary: agent inbox" },
	{ href: "/glossary/mcp", label: "Glossary: MCP" },
	{ href: "/llms.txt", label: "llms.txt" },
	{ href: "/skill.md", label: "skill.md" },
];

export default function AgentFacts() {
	return (
		<>
			<section id="facts">
				<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
					<div className="text-center">
						<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
							What an agent gets from Reloop
						</h2>
						<p className="mx-auto mt-6 max-w-xl text-base text-text-sub-600 dark:text-white/50">
							An address it can receive at, a webhook it can act on, an API it
							can send from, and tools it can call. Hosted or self-hosted.
						</p>
					</div>

					<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{facts.map((fact) => (
							<div key={fact.label} className="text-center">
								<div className="mb-4 font-bold font-mono text-3xl text-primary-base">
									{fact.value}
								</div>
								<div className="font-medium text-text-strong-950 dark:text-white">
									{fact.label}
								</div>
								<div className="text-sm text-text-sub-600 dark:text-white/50">
									{fact.detail}
								</div>
							</div>
						))}
					</div>

					<div className="mt-20 grid gap-6 lg:grid-cols-3">
						{commands.map((command) => (
							<div
								key={command.title}
								className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 dark:border-white/10 dark:bg-transparent"
							>
								<h3 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
									{command.title}
								</h3>
								<pre className="mt-4 overflow-x-auto rounded-lg border border-white/5 bg-[#0a0a0a] p-3 font-mono text-[12px] text-primary-base">
									<code>{command.code}</code>
								</pre>
								<Link
									href={command.href}
									className="mt-4 inline-block font-medium text-[13px] text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-[3px] dark:text-white dark:decoration-white/20"
								>
									{command.linkLabel}
								</Link>
							</div>
						))}
					</div>

					<div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
						<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 dark:border-white/10 dark:bg-transparent">
							<h3 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
								What the email.received webhook delivers
							</h3>
							<pre className="mt-4 overflow-x-auto rounded-lg border border-white/5 bg-[#0a0a0a] p-3 font-mono text-[12px] text-white/80">
								<code>{inboundPayload}</code>
							</pre>
						</div>
						<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 dark:border-white/10 dark:bg-transparent">
							<h3 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
								Keep reading
							</h3>
							<ul className="mt-4 grid gap-2 text-[14px]">
								{reading.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href}
											className="text-text-sub-600 underline decoration-stroke-soft-200 underline-offset-[3px] hover:text-text-strong-950 dark:text-white/60 dark:decoration-white/20 dark:hover:text-white"
										>
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>
			<FaqSection
				items={agentFaq}
				title="Email for AI agents, answered."
				id="agent-faq"
			/>
		</>
	);
}
