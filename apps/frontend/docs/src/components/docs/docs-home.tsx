"use client";

import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ─── Design-system primitives (match docs + dashboard chrome) ─── */

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="mb-4 font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider">
			{children}
		</p>
	);
}

function SectionHeading({
	title,
	description,
	action,
}: {
	title: string;
	description?: string;
	action?: { label: string; href: string };
}) {
	return (
		<div className="mb-6 flex flex-wrap items-end justify-between gap-3">
			<div className="min-w-0 max-w-2xl">
				<h2 className="font-semibold text-xl text-text-strong-950 tracking-tight dark:text-white">
					{title}
				</h2>
				{description ? (
					<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed">
						{description}
					</p>
				) : null}
			</div>
			{action ? (
				<Link
					href={action.href}
					className="inline-flex shrink-0 items-center gap-1.5 font-medium text-[13.5px] text-primary-base transition-colors hover:text-primary-dark"
				>
					{action.label}
					<Icon name="arrow-right" className="size-3.5" />
				</Link>
			) : null}
		</div>
	);
}

/** Outer soft well — same language as api-endpoint-bar */
function SoftWell({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"rounded-[18px] border border-stroke-soft-100 bg-[#fafafa] p-0.5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0e]",
				className,
			)}
		>
			{children}
		</div>
	);
}

function SoftPanel({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"rounded-[16px] border border-stroke-soft-100/70 bg-bg-white-0 dark:border-stroke-soft-100/15 dark:bg-zinc-950",
				className,
			)}
		>
			{children}
		</div>
	);
}

function NavCard({
	href,
	title,
	description,
	icon,
}: {
	href: string;
	title: string;
	description: string;
	icon: string;
}) {
	return (
		<Link
			href={href}
			className="group flex h-full flex-col gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 transition-all hover:border-black/40 hover:bg-black/[0.02] dark:border-stroke-soft-100/40 dark:bg-zinc-950 dark:hover:border-white/40 dark:hover:bg-white/[0.02]"
		>
			<span className="flex size-9 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:border-stroke-soft-100/40 dark:group-hover:text-white">
				<Icon name={icon} className="size-4" />
			</span>
			<div className="min-w-0">
				<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
					{title}
				</p>
				<p className="mt-1.5 text-[13.5px] text-text-sub-600 leading-relaxed">
					{description}
				</p>
			</div>
		</Link>
	);
}

function CompactLink({
	href,
	title,
	description,
	icon,
}: {
	href: string;
	title: string;
	description: string;
	icon: string;
}) {
	return (
		<Link
			href={href}
			className="group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]"
		>
			<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:border-stroke-soft-100/40 dark:group-hover:text-white">
				<Icon name={icon} className="size-3.5" />
			</span>
			<span className="min-w-0">
				<span className="block font-semibold text-[14px] text-text-strong-950 tracking-tight dark:text-white">
					{title}
				</span>
				<span className="mt-0.5 block text-[13px] text-text-sub-600 leading-snug">
					{description}
				</span>
			</span>
		</Link>
	);
}

/* ─── AI prompt ─────────────────────────────────────────── */

const AI_PROMPT =
	"Fetch https://reloop.sh/docs and help me send my first email with the Reloop API. Create an API key, verify a domain, and send a test message.";

const AI_TOOLS = [
	{ name: "siCursor", label: "Cursor", href: "https://cursor.com" },
	{ name: "siV0", label: "v0", href: "https://v0.dev" },
	{ name: "siReplit", label: "Replit", href: "https://replit.com" },
	{ name: "siWindsurf", label: "Windsurf", href: "https://windsurf.com" },
] as const;

function PromptCard() {
	const [copied, setCopied] = useState(false);

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(AI_PROMPT);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<div className="flex h-full flex-col gap-4">
			<div className="relative min-h-[120px] flex-1 rounded-xl border border-stroke-soft-100/70 bg-bg-white-0 p-4 dark:border-stroke-soft-100/15 dark:bg-zinc-950">
				<p className="pr-10 font-mono text-[13px] text-text-sub-600 leading-relaxed">
					{AI_PROMPT}
				</p>
				<button
					type="button"
					onClick={onCopy}
					aria-label={copied ? "Copied" : "Copy prompt"}
					className="absolute top-3 right-3 cursor-pointer rounded-md p-1.5 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5 dark:hover:text-white"
				>
					{copied ? (
						<Check className="size-4 text-emerald-500" />
					) : (
						<Copy className="size-4" />
					)}
				</button>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				{AI_TOOLS.map((tool) => (
					<a
						key={tool.name}
						href={tool.href}
						target="_blank"
						rel="noreferrer"
						title={tool.label}
						className="flex size-8 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:border-stroke-soft-200 hover:text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-zinc-950 dark:hover:text-white"
					>
						<SimpleIcon name={tool.name} size={14} className="size-3.5" />
					</a>
				))}
			</div>
		</div>
	);
}

/* ─── Page ──────────────────────────────────────────────── */

export function DocsHome() {
	return (
		<div className="not-prose mx-auto w-full max-w-6xl space-y-12 px-6 py-8 md:px-10 md:py-10">
			{/* ── Hero ── */}
			<header className="max-w-2xl">
				<p className="mb-3 font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider">
					Documentation
				</p>
				<h1 className="font-semibold text-[1.75rem] text-text-strong-950 leading-tight tracking-[-0.03em] sm:text-3xl dark:text-white">
					Learn how to send with Reloop
				</h1>
				<p className="mt-3.5 text-[16px] text-text-sub-600 leading-relaxed tracking-[-0.01em]">
					Guides, API reference, SDKs, and agent tooling — everything you need to
					send, receive, and automate email.
				</p>
				<div className="mt-6 flex flex-wrap gap-2.5">
					<Link
						href="/api/mail/post-api-mail-v1send"
						className="inline-flex h-9 items-center gap-2 rounded-xl bg-text-strong-950 px-4 font-medium text-[13.5px] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
					>
						Send your first email
						<Icon name="arrow-right" className="size-3.5" />
					</Link>
					<Link
						href="/api"
						className="inline-flex h-9 items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 font-medium text-[13.5px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5"
					>
						API Reference
					</Link>
				</div>
			</header>

			{/* ── AI agents ── */}
			<section>
				<SoftWell>
					<div className="grid overflow-hidden rounded-[16px] md:grid-cols-2">
						<div className="border-stroke-soft-100/70 border-b p-6 md:border-r md:border-b-0 md:p-8 dark:border-stroke-soft-100/15">
							<SectionLabel>AI Agents</SectionLabel>
							<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight dark:text-white">
								Get started with your AI agent
							</h2>
							<p className="mt-2 max-w-md text-[14.5px] text-text-sub-600 leading-relaxed">
								Copy this prompt into Cursor, Claude, or any agent to install
								Reloop, verify a domain, and send a test email.
							</p>
							<Link
								href="/integrations/ai-tools/mcp-server"
								className="mt-5 inline-flex items-center gap-1.5 font-medium text-[13.5px] text-primary-base transition-colors hover:text-primary-dark"
							>
								MCP server guide
								<Icon name="arrow-right" className="size-3.5" />
							</Link>
						</div>
						<div className="bg-bg-white-0 p-6 md:p-8 dark:bg-zinc-950">
							<PromptCard />
						</div>
					</div>
				</SoftWell>
			</section>

			{/* ── Get started ── */}
			<section>
				<SectionHeading
					title="Get started"
					description="Pick a path and ship your first message in minutes."
				/>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<NavCard
						href="/api/mail/post-api-mail-v1send"
						icon="mail-send"
						title="Send email"
						description="POST /mail and deliver your first message."
					/>
					<NavCard
						href="/learn/domain"
						icon="globe"
						title="Verify a domain"
						description="SPF, DKIM, and DMARC setup for deliverability."
					/>
					<NavCard
						href="/learn/api-keys"
						icon="key-new"
						title="API keys"
						description="Create, rotate, and scope credentials."
					/>
					<NavCard
						href="/resources/sdks"
						icon="code"
						title="Install an SDK"
						description="Node, Python, Go, Rust, PHP, and more."
					/>
				</div>
			</section>

			{/* ── Product guides ── */}
			<section>
				<SectionHeading
					title="Product guides"
					description="Deep dives into Reloop’s core features."
					action={{ label: "View all", href: "/docs/learn" }}
				/>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<NavCard
						href="/learn/emails"
						icon="mail-single"
						title="Emails"
						description="Transactional sending, SMTP, and delivery."
					/>
					<NavCard
						href="/learn/templates"
						icon="file-code"
						title="Templates"
						description="Design, version, and send dynamic HTML."
					/>
					<NavCard
						href="/learn/contacts"
						icon="contacts"
						title="Contacts"
						description="Audiences, groups, channels, and properties."
					/>
					<NavCard
						href="/learn/agent-inbox"
						icon="inbox"
						title="Agent Inbox"
						description="Receive and reply to inbound mail."
					/>
					<NavCard
						href="/learn/workflows"
						icon="workflow"
						title="Workflows"
						description="Automate multi-step email sequences."
					/>
				</div>
			</section>

			{/* ── API modules ── */}
			<section>
				<SectionHeading
					title="API modules"
					description="Full reference for every resource."
					action={{ label: "Open API Reference", href: "/docs/api" }}
				/>
				<div className="grid gap-4 lg:grid-cols-3">
					<SoftWell>
						<SoftPanel className="h-full p-5">
							<SectionLabel>Sending</SectionLabel>
							<div className="flex flex-col gap-0.5">
								<CompactLink
									href="/api/mail/post-api-mail-v1send"
									icon="mail-send"
									title="Mail"
									description="Send transactional and marketing email"
								/>
								<CompactLink
									href="/api/template"
									icon="file-code"
									title="Templates"
									description="Create, version, and test templates"
								/>
								<CompactLink
									href="/api/domain"
									icon="globe"
									title="Domains"
									description="Verify DNS and manage sending domains"
								/>
							</div>
						</SoftPanel>
					</SoftWell>
					<SoftWell>
						<SoftPanel className="h-full p-5">
							<SectionLabel>Audience</SectionLabel>
							<div className="flex flex-col gap-0.5">
								<CompactLink
									href="/api/contacts"
									icon="contacts"
									title="Contacts"
									description="Contacts, groups, and properties"
								/>
								<CompactLink
									href="/api/api-key"
									icon="key-new"
									title="API Keys"
									description="Create, rotate, and scope keys"
								/>
								<CompactLink
									href="/api/webhook"
									icon="webhook"
									title="Webhooks"
									description="Endpoints, deliveries, and retries"
								/>
							</div>
						</SoftPanel>
					</SoftWell>
					<SoftWell>
						<SoftPanel className="h-full p-5">
							<SectionLabel>Observability</SectionLabel>
							<div className="flex flex-col gap-0.5">
								<CompactLink
									href="/api/logs"
									icon="file-text"
									title="Logs"
									description="Email logs, stats, and activity"
								/>
								<CompactLink
									href="/api/inbox"
									icon="inbox"
									title="Inbox"
									description="Mailboxes, threads, and messages"
								/>
								<CompactLink
									href="/api/upload"
									icon="file-upload"
									title="Upload"
									description="Attach files to outbound email"
								/>
							</div>
						</SoftPanel>
					</SoftWell>
				</div>
			</section>

			{/* ── Bottom row ── */}
			<section className="grid gap-4 lg:grid-cols-3">
				<SoftWell>
					<SoftPanel className="h-full p-5">
						<SectionLabel>Examples</SectionLabel>
						<div className="flex flex-col gap-0.5">
							<CompactLink
								href="/examples/nodejs/nextjs"
								icon="code"
								title="Next.js"
								description="App Router + Reloop SDK"
							/>
							<CompactLink
								href="/examples/python/fastapi"
								icon="code"
								title="FastAPI"
								description="Python SDK integration"
							/>
							<CompactLink
								href="/examples/smtp/introduction"
								icon="server"
								title="SMTP"
								description="Relay via any SMTP client"
							/>
						</div>
					</SoftPanel>
				</SoftWell>
				<SoftWell>
					<SoftPanel className="h-full p-5">
						<SectionLabel>Resources</SectionLabel>
						<div className="flex flex-col gap-0.5">
							<CompactLink
								href="/resources/sdks"
								icon="box"
								title="SDKs"
								description="Official client libraries"
							/>
							<CompactLink
								href="/resources/cli"
								icon="terminal"
								title="CLI"
								description="Command-line tooling"
							/>
							<CompactLink
								href="/resources/security"
								icon="shield-check"
								title="Security"
								description="Auth, secrets, and best practices"
							/>
						</div>
					</SoftPanel>
				</SoftWell>
				<SoftWell>
					<SoftPanel className="flex h-full flex-col justify-between gap-4 p-5">
						<div>
							<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								Self-host Reloop
							</p>
							<p className="mt-2 text-[13.5px] text-text-sub-600 leading-relaxed">
								Run the full stack on Vercel, Railway, Docker, or your own VPS.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Link
								href="/self-host"
								className="inline-flex h-8 items-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-3 font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5"
							>
								Self-host guide
							</Link>
							<Link
								href="/integrations"
								className="inline-flex h-8 items-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-3 font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5"
							>
								Integrations
							</Link>
						</div>
					</SoftPanel>
				</SoftWell>
			</section>
		</div>
	);
}
