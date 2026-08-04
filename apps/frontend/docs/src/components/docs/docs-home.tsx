"use client";

import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ─── Shared chrome ─────────────────────────────────────── */

function Eyebrow({
	items,
}: {
	items: { label: string; href?: string }[];
}) {
	return (
		<p className="mb-4 font-medium text-[11px] text-text-sub-600 uppercase tracking-[0.14em]">
			{items.map((item, i) => (
				<span key={item.label}>
					{i > 0 && (
						<span className="mx-1.5 text-text-soft-400" aria-hidden>
							·
						</span>
					)}
					{item.href ? (
						<Link
							href={item.href}
							className="text-primary-base transition-colors hover:text-primary-dark"
						>
							[{item.label}]
						</Link>
					) : (
						<span>[{item.label}]</span>
					)}
				</span>
			))}
		</p>
	);
}

/** Diagonal stripe block — Medusa-style accent, Reloop muted surface */
function StripeAccent({ className }: { className?: string }) {
	return (
		<div
			aria-hidden
			className={cn(
				"h-8 w-full max-w-[220px] rounded-md border border-stroke-soft-100 bg-[repeating-linear-gradient(-45deg,transparent,transparent_3px,var(--stroke-soft-100)_3px,var(--stroke-soft-100)_4px)] dark:border-stroke-soft-100/40 dark:bg-[repeating-linear-gradient(-45deg,transparent,transparent_3px,rgba(255,255,255,0.06)_3px,rgba(255,255,255,0.06)_4px)]",
				className,
			)}
		/>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="mb-6 font-medium text-[11px] text-text-sub-600 uppercase tracking-[0.14em]">
			[{children}]
		</p>
	);
}

function HomeLink({
	href,
	children,
	icon,
}: {
	href: string;
	children: React.ReactNode;
	icon?: string;
}) {
	return (
		<Link
			href={href}
			className="group flex items-center gap-3 rounded-lg py-1.5 text-[15px] text-text-strong-950 transition-colors hover:text-primary-base dark:text-white dark:hover:text-primary-base"
		>
			<span
				aria-hidden
				className="flex size-8 shrink-0 items-center justify-center rounded-md border border-stroke-soft-100 bg-[repeating-linear-gradient(-45deg,transparent,transparent_2px,var(--stroke-soft-100)_2px,var(--stroke-soft-100)_3px)] dark:border-stroke-soft-100/40 dark:bg-[repeating-linear-gradient(-45deg,transparent,transparent_2px,rgba(255,255,255,0.06)_2px,rgba(255,255,255,0.06)_3px)]"
			>
				{icon ? (
					<Icon
						name={icon}
						className="size-3.5 text-text-sub-600 transition-colors group-hover:text-primary-base"
					/>
				) : null}
			</span>
			<span className="font-medium leading-snug">{children}</span>
		</Link>
	);
}

function Cell({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"border-stroke-soft-100 border-b border-r p-6 md:p-8 dark:border-stroke-soft-100/40",
				className,
			)}
		>
			{children}
		</div>
	);
}

/* ─── AI prompt card ────────────────────────────────────── */

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
		<div className="flex h-full flex-col justify-center gap-5">
			<div className="relative rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 shadow-sm dark:border-stroke-soft-100/40 dark:bg-zinc-950">
				<p className="pr-10 font-mono text-[13px] text-text-sub-600 leading-relaxed">
					{AI_PROMPT}
				</p>
				<button
					type="button"
					onClick={onCopy}
					aria-label={copied ? "Copied" : "Copy prompt"}
					className="absolute top-3 right-3 rounded-md p-1.5 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5 dark:hover:text-white"
				>
					{copied ? (
						<Check className="size-4 text-emerald-500" />
					) : (
						<Copy className="size-4" />
					)}
				</button>
			</div>
			<div className="flex flex-wrap items-center gap-2.5">
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

/* ─── Recipe card ───────────────────────────────────────── */

function RecipeCard({
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
			className="group flex flex-col gap-3 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-5 transition-all hover:border-primary-base/40 hover:shadow-sm dark:border-stroke-soft-100/40 dark:bg-zinc-950 dark:hover:border-primary-base/40"
		>
			<span className="flex size-10 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-weak-50 text-text-sub-600 transition-colors group-hover:border-primary-base/30 group-hover:text-primary-base dark:border-stroke-soft-100/40 dark:bg-white/5">
				<Icon name={icon} className="size-5" />
			</span>
			<div>
				<p className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
					{title}
				</p>
				<p className="mt-1 text-[13.5px] text-text-sub-600 leading-relaxed">
					{description}
				</p>
			</div>
		</Link>
	);
}

/* ─── Module row ────────────────────────────────────────── */

function ModuleItem({
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
			className="group flex items-start gap-3 rounded-lg py-1.5 transition-colors"
		>
			<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-text-sub-600 transition-colors group-hover:text-primary-base">
				<Icon name={icon} className="size-4" />
			</span>
			<span className="min-w-0">
				<span className="block font-medium text-[14.5px] text-text-strong-950 transition-colors group-hover:text-primary-base dark:text-white">
					{title}
				</span>
				<span className="mt-0.5 block text-[13px] text-text-sub-600 leading-snug">
					{description}
				</span>
			</span>
		</Link>
	);
}

/* ─── Page ──────────────────────────────────────────────── */

export function DocsHome() {
	return (
		<div className="not-prose w-full border-stroke-soft-100 border-t dark:border-stroke-soft-100/40">
			{/* ── Hero ── */}
			<section className="border-stroke-soft-100 border-b px-6 py-14 text-center md:px-10 md:py-20 dark:border-stroke-soft-100/40">
				<Eyebrow
					items={[
						{ label: "RELOOP DOCS" },
						{ label: "INTRODUCTION", href: "/docs" },
					]}
				/>
				<h1 className="mx-auto max-w-3xl font-semibold text-[2rem] text-text-strong-950 leading-[1.15] tracking-[-0.03em] md:text-[2.75rem] dark:text-white">
					Learn how to send with Reloop.
				</h1>
				<div className="mx-auto mt-5 flex max-w-2xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
					<StripeAccent className="hidden sm:block sm:max-w-[180px]" />
					<p className="font-semibold text-[1.75rem] text-text-strong-950 tracking-[-0.03em] md:text-[2.25rem] dark:text-white">
						Explore our guides.
					</p>
				</div>
			</section>

			{/* ── AI agents ── */}
			<section className="grid border-stroke-soft-100 border-b md:grid-cols-2 dark:border-stroke-soft-100/40">
				<div className="border-stroke-soft-100 border-b p-6 md:border-r md:border-b-0 md:p-10 dark:border-stroke-soft-100/40">
					<Eyebrow
						items={[
							{ label: "AI AGENTS" },
							{ label: "LEARN MORE", href: "/docs/integrations/ai-tools/mcp-server" },
						]}
					/>
					<h2 className="font-semibold text-[1.5rem] text-text-strong-950 tracking-[-0.02em] md:text-[1.75rem] dark:text-white">
						Get started with your AI agent.
					</h2>
					<p className="mt-3 max-w-md text-[15px] text-text-sub-600 leading-relaxed">
						Use this prompt with any AI agent to install Reloop, verify a domain,
						and send your first email.
					</p>
				</div>
				<div className="bg-bg-weak-50/60 p-6 md:p-10 dark:bg-white/[0.02]">
					<PromptCard />
				</div>
			</section>

			{/* ── Explore by area ── */}
			<section className="grid sm:grid-cols-2 lg:grid-cols-3">
				<Cell>
					<SectionLabel>GET STARTED</SectionLabel>
					<div className="flex flex-col gap-1">
						<HomeLink href="/docs/api/mail/post-api-mail-v1send" icon="mail-send">
							Send your first email
						</HomeLink>
						<HomeLink href="/docs/learn/domain" icon="globe">
							Verify a domain
						</HomeLink>
						<HomeLink href="/docs/learn/api-keys" icon="key-new">
							Create an API key
						</HomeLink>
						<HomeLink href="/docs/resources/sdks" icon="code">
							Install an SDK
						</HomeLink>
					</div>
				</Cell>
				<Cell>
					<SectionLabel>PRODUCT</SectionLabel>
					<div className="flex flex-col gap-1">
						<HomeLink href="/docs/learn/emails" icon="mail-single">
							Emails
						</HomeLink>
						<HomeLink href="/docs/learn/templates" icon="file-code">
							Templates
						</HomeLink>
						<HomeLink href="/docs/learn/contacts" icon="contacts">
							Contacts
						</HomeLink>
						<HomeLink href="/docs/learn/webhooks" icon="webhook">
							Webhooks
						</HomeLink>
					</div>
				</Cell>
				<Cell className="sm:col-span-2 lg:col-span-1">
					<SectionLabel>PLATFORM</SectionLabel>
					<div className="flex flex-col gap-1">
						<HomeLink href="/docs/learn/agent-inbox" icon="inbox">
							Agent Inbox
						</HomeLink>
						<HomeLink href="/docs/learn/workflows" icon="workflow">
							Workflows
						</HomeLink>
						<HomeLink href="/docs/self-host" icon="server">
							Self-host Reloop
						</HomeLink>
						<HomeLink href="/docs/integrations" icon="connector">
							Integrations
						</HomeLink>
					</div>
				</Cell>
			</section>

			{/* ── Guides / recipes ── */}
			<section className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40">
				<div className="grid lg:grid-cols-2">
					<div className="flex items-center justify-center border-stroke-soft-100 border-b bg-bg-weak-50/50 p-10 lg:border-r lg:border-b-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
						<div className="relative flex size-40 items-center justify-center">
							<div className="absolute inset-0 rounded-3xl border border-stroke-soft-100 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,var(--stroke-soft-100)_4px,var(--stroke-soft-100)_5px)] opacity-60 dark:border-stroke-soft-100/40" />
							<Icon
								name="mail-send"
								className="relative size-14 text-text-sub-600"
							/>
						</div>
					</div>
					<div className="p-6 md:p-10">
						<Eyebrow
							items={[
								{ label: "GUIDES" },
								{ label: "VIEW ALL", href: "/docs/learn" },
							]}
						/>
						<h2 className="font-semibold text-[1.5rem] text-text-strong-950 tracking-[-0.02em] md:text-[1.75rem] dark:text-white">
							Reloop supports every email use case.
						</h2>
						<p className="mt-3 max-w-lg text-[15px] text-text-sub-600 leading-relaxed">
							These guides show how to send transactional mail, build audiences,
							handle inbound, and automate with workflows.
						</p>
					</div>
				</div>
				<div className="grid gap-4 border-stroke-soft-100 border-t p-6 sm:grid-cols-2 lg:grid-cols-3 md:p-8 dark:border-stroke-soft-100/40">
					<RecipeCard
						href="/docs/learn/emails"
						icon="mail-send"
						title="Transactional email"
						description="Password resets, receipts, and product notifications via API or SMTP."
					/>
					<RecipeCard
						href="/docs/learn/contacts"
						icon="contacts"
						title="Audiences & contacts"
						description="Manage contacts, groups, channels, and custom properties."
					/>
					<RecipeCard
						href="/docs/learn/templates"
						icon="file-code"
						title="Templates"
						description="Design, version, and send dynamic HTML templates."
					/>
					<RecipeCard
						href="/docs/learn/agent-inbox"
						icon="inbox"
						title="Agent Inbox"
						description="Receive and reply to inbound email from your product or agent."
					/>
					<RecipeCard
						href="/docs/learn/webhooks"
						icon="webhook"
						title="Event-driven apps"
						description="Subscribe to delivery, open, click, and bounce events."
					/>
					<RecipeCard
						href="/docs/learn/workflows"
						icon="workflow"
						title="Workflows"
						description="Automate multi-step email sequences and custom events."
					/>
				</div>
			</section>

			{/* ── API modules ── */}
			<section className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40">
				<div className="flex flex-wrap items-center gap-4 border-stroke-soft-100 border-b px-6 py-8 md:px-10 dark:border-stroke-soft-100/40">
					<h2 className="font-semibold text-[1.5rem] text-text-strong-950 tracking-[-0.02em] md:text-[1.75rem] dark:text-white">
						API modules
					</h2>
					<StripeAccent className="hidden max-w-none flex-1 sm:block" />
				</div>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3">
					<Cell>
						<SectionLabel>SENDING</SectionLabel>
						<div className="flex flex-col gap-3">
							<ModuleItem
								href="/docs/api/mail/post-api-mail-v1send"
								icon="mail-send"
								title="Mail"
								description="Send transactional and marketing email"
							/>
							<ModuleItem
								href="/docs/api/template"
								icon="file-code"
								title="Templates"
								description="Create, version, and test templates"
							/>
							<ModuleItem
								href="/docs/api/domain"
								icon="globe"
								title="Domains"
								description="Verify DNS and manage sending domains"
							/>
						</div>
					</Cell>
					<Cell>
						<SectionLabel>AUDIENCE</SectionLabel>
						<div className="flex flex-col gap-3">
							<ModuleItem
								href="/docs/api/contacts"
								icon="contacts"
								title="Contacts"
								description="Contacts, groups, and properties"
							/>
							<ModuleItem
								href="/docs/api/api-key"
								icon="key-new"
								title="API Keys"
								description="Create, rotate, and scope keys"
							/>
							<ModuleItem
								href="/docs/api/webhook"
								icon="webhook"
								title="Webhooks"
								description="Endpoints, deliveries, and retries"
							/>
						</div>
					</Cell>
					<Cell className="bg-bg-weak-50/40 sm:col-span-2 lg:col-span-1 dark:bg-white/[0.02]">
						<SectionLabel>OBSERVABILITY</SectionLabel>
						<div className="flex flex-col gap-3">
							<ModuleItem
								href="/docs/api/logs"
								icon="file-text"
								title="Logs"
								description="Email logs, stats, and contact activity"
							/>
							<ModuleItem
								href="/docs/api/inbox"
								icon="inbox"
								title="Inbox"
								description="Mailboxes, threads, and messages"
							/>
							<ModuleItem
								href="/docs/api/upload"
								icon="file-upload"
								title="Upload"
								description="Attach files to outbound email"
							/>
						</div>
					</Cell>
				</div>
			</section>

			{/* ── Bottom CTA strip ── */}
			<section className="grid border-stroke-soft-100 border-t md:grid-cols-3 dark:border-stroke-soft-100/40">
				<div className="border-stroke-soft-100 border-b p-6 md:border-r md:border-b-0 md:p-8 dark:border-stroke-soft-100/40">
					<SectionLabel>EXAMPLES</SectionLabel>
					<div className="flex flex-col gap-1">
						<HomeLink href="/docs/examples/nodejs/nextjs" icon="code">
							Next.js
						</HomeLink>
						<HomeLink href="/docs/examples/python/fastapi" icon="code">
							FastAPI
						</HomeLink>
						<HomeLink href="/docs/examples/smtp/introduction" icon="server">
							SMTP
						</HomeLink>
					</div>
				</div>
				<div className="border-stroke-soft-100 border-b p-6 md:border-r md:border-b-0 md:p-8 dark:border-stroke-soft-100/40">
					<SectionLabel>RESOURCES</SectionLabel>
					<div className="flex flex-col gap-1">
						<HomeLink href="/docs/resources/sdks" icon="box">
							SDKs
						</HomeLink>
						<HomeLink href="/docs/resources/cli" icon="terminal">
							CLI
						</HomeLink>
						<HomeLink href="/docs/resources/security" icon="shield-check">
							Security
						</HomeLink>
					</div>
				</div>
				<div className="bg-bg-weak-50/50 p-6 md:p-8 dark:bg-white/[0.02]">
					<p className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
						Need the full reference?
					</p>
					<p className="mt-2 text-[13.5px] text-text-sub-600 leading-relaxed">
						Browse every endpoint, schema, and webhook event in the API reference.
					</p>
					<Link
						href="/docs/api"
						className="mt-4 inline-flex items-center gap-1.5 font-medium text-[14px] text-primary-base transition-colors hover:text-primary-dark"
					>
						Open API Reference
						<Icon name="arrow-right" className="size-3.5" />
					</Link>
				</div>
			</section>
		</div>
	);
}
