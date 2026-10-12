import { cn } from "@reloop/ui/cn";
import {
	Activity,
	AlertTriangle,
	ArrowUpRight,
	BadgeCheck,
	Ban,
	Calendar,
	Code2,
	Eye,
	Gauge,
	Globe,
	MailCheck,
	Search,
	Send,
	ShieldAlert,
	ShieldCheck,
	Sparkles,
	Terminal,
} from "lucide-react";
import Link from "next/link";
import { type ComponentType, Fragment } from "react";
import { TempTimerIcon } from "./art/temp-timer-icon";

export type ToolCategory = "deliverability" | "auth" | "domain" | "content";

export type ToolItem = {
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
	path: string;
	/** Group on the /tools index; unset for links that aren't tools (API docs, suggestions). */
	category?: ToolCategory;
	/** Render the full blueprint art panel instead of the icon box. */
	art?:
		| "timer"
		| "validator"
		| "deliverability"
		| "spoof"
		| "blocklist"
		| "dns"
		| "domain-age"
		| "who-sends"
		| "auth"
		| "reputation"
		| "lookalike"
		| "spam-words"
		| "bimi"
		| "html-editor"
		| "api"
		| "suggest";
};

export const ALL_TOOLS: ToolItem[] = [
	{
		title: "Free Email Validator & List Cleaner",
		description:
			"Verify syntax, disposable domains, and active MX records to keep your email list clean.",
		icon: MailCheck,
		path: "/tools/email-validator",
		category: "deliverability",
		art: "validator",
	},
	{
		title: "Email Deliverability & Spam Tester",
		description:
			"Send a test email to analyze inbox placement, spam score, and SPF/DKIM alignment.",
		icon: Send,
		path: "/tools/deliverability-tester",
		category: "deliverability",
		art: "deliverability",
	},
	{
		title: "Email Spoofing & Phishing Checker",
		description:
			"Test whether unauthorized senders can forge your domain to deliver phishing emails.",
		icon: ShieldAlert,
		path: "/tools/spoof-checker",
		category: "auth",
		art: "spoof",
	},
	{
		title: "IP & Domain DNS Blocklist Checker",
		description:
			"Check your sending IP address and domain against 50+ public DNS blocklists in real time.",
		icon: Ban,
		path: "/tools/blocklist-checker",
		category: "deliverability",
		art: "blocklist",
	},
	{
		title: "DNS Lookup & Record Analyzer",
		description:
			"Inspect MX, SPF, DKIM, DMARC, and A records with syntax validation and live diagnostics.",
		icon: Globe,
		path: "/tools/dns-lookup",
		category: "auth",
		art: "dns",
	},
	{
		title: "Domain Age Calculator",
		description:
			"See exactly how old any domain is, with its registration date, expiry date and registrar.",
		icon: Calendar,
		path: "/tools/domain-age",
		category: "domain",
		art: "domain-age",
	},
	{
		title: "Domain Warmup Checker",
		description:
			"Check a domain's warmup stage and SPF, DMARC and MX readiness before you start sending.",
		icon: Gauge,
		path: "/tools/domain-warmup-checker",
		category: "domain",
	},
	{
		title: "Domain ESP & Email Sender Lookup",
		description:
			"Identify all third-party email service providers authorized to send from your domain.",
		icon: Search,
		path: "/tools/who-sends",
		category: "domain",
		art: "who-sends",
	},
	{
		title: "SPF, DKIM & DMARC Checker",
		description:
			"Validate email authentication records to guarantee proper sender alignment and security.",
		icon: ShieldCheck,
		path: "/tools/auth-checker",
		category: "auth",
		art: "auth",
	},
	{
		title: "Temp & Disposable Email Checker",
		description:
			"Detect throwaway inboxes and burner addresses before they bounce or skew signup metrics.",
		icon: TempTimerIcon,
		path: "/tools/temp-email-checker",
		category: "deliverability",
		art: "timer",
	},
	{
		title: "Domain Reputation & Health Checker",
		description:
			"Evaluate your domain health score, spam placement risk, and mail configuration flaws.",
		icon: Activity,
		path: "/tools/domain-reputation-checker",
		category: "domain",
		art: "reputation",
	},
	{
		title: "Lookalike Domain & Phishing Scanner",
		description:
			"Detect registered typosquats and lookalike domains impersonating your brand online.",
		icon: Eye,
		path: "/tools/lookalike-watch",
		category: "domain",
		art: "lookalike",
	},
	{
		title: "Email Spam Words & Subject Checker",
		description:
			"Scan subject lines and body copy for spam trigger words that hurt inbox deliverability.",
		icon: AlertTriangle,
		path: "/tools/email-spam-words-checker",
		category: "content",
		art: "spam-words",
	},
	{
		title: "BIMI & Brand Avatar Checker",
		description:
			"Verify your BIMI DNS record and SVG logo to display verified brand avatars in inboxes.",
		icon: BadgeCheck,
		path: "/tools/bimi-checker",
		category: "auth",
		art: "bimi",
	},
	{
		title: "Email HTML Template Editor",
		description:
			"Design, edit, and preview responsive HTML email templates across mobile and desktop.",
		icon: Code2,
		path: "/tools/email-html-editor",
		category: "content",
		art: "html-editor",
	},
	{
		title: "Developer Tools & REST API",
		description:
			"Integrate real-time email verification and DNS lookups via our low-latency REST API.",
		icon: Terminal,
		path: "/docs/api",
		art: "api",
	},
	{
		title: "Suggest a New Tool",
		description:
			"Need an email or DNS utility that isn't listed here? Suggest a tool and we'll build it.",
		icon: Sparkles,
		path: "/contact",
		art: "suggest",
	},
];

export function getBorderClass(index: number, total: number) {
	const isLastRowMobile = index === total - 1;
	const isLastRowTablet = index >= total - (total % 2 === 0 ? 2 : 1);
	const isLeftColTablet = index % 2 === 0;
	const isLastRowDesktop = index >= total - (total % 4 === 0 ? 4 : total % 4);
	const isRightColDesktop = (index + 1) % 4 === 0;

	return cn(
		// Mobile borders
		!isLastRowMobile && "border-b",
		// Tablet borders
		isLeftColTablet ? "sm:border-r" : "sm:border-r-0",
		isLastRowTablet ? "sm:border-b-0" : "sm:border-b",
		// Desktop borders
		isRightColDesktop ? "lg:border-r-0" : "lg:border-r",
		isLastRowDesktop ? "lg:border-b-0" : "lg:border-b",
	);
}

export const CATEGORIES: {
	id: ToolCategory;
	title: string;
	description: string;
}[] = [
	{
		id: "deliverability",
		title: "Deliverability",
		description:
			"Check that your list is clean and your mail lands in the inbox.",
	},
	{
		id: "auth",
		title: "Authentication & DNS",
		description: "Verify the records that prove your mail is really from you.",
	},
	{
		id: "domain",
		title: "Domain intelligence",
		description:
			"See how a domain looks to inbox providers, and who sends for it.",
	},
	{
		id: "content",
		title: "Content & templates",
		description: "Write and design emails that read well and stay out of spam.",
	},
];

function ToolCard({ tool }: { tool: ToolItem }) {
	const IconComponent = tool.icon;

	return (
		<li className="border-stroke-soft-100 border-r border-b dark:border-white/10">
			<Link
				href={tool.path}
				className={cn(
					"group flex h-full items-start gap-3.5 px-4 py-6 sm:px-6 lg:px-7",
					"transition-colors duration-200 ease-out hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-sub-300 focus-visible:ring-inset",
					"motion-reduce:transition-none",
				)}
			>
				<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:group-hover:text-white">
					<IconComponent className="size-[18px] stroke-[1.75]" />
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<h3 className="font-medium text-[14.5px] text-text-strong-950 leading-snug tracking-tight dark:text-white">
							{tool.title}
						</h3>
						<ArrowUpRight
							aria-hidden
							className="-translate-x-1 mt-0.5 size-4 shrink-0 text-text-sub-600 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none dark:text-white/60"
						/>
					</div>
					<p className="mt-1 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
						{tool.description}
					</p>
				</div>
			</Link>
		</li>
	);
}

export function ToolsGrid() {
	return (
		<section
			id="tools-list"
			aria-label="All Free Developer Tools"
			className="w-full"
		>
			{CATEGORIES.map((category) => {
				const tools = ALL_TOOLS.filter((tool) => tool.category === category.id);
				if (tools.length === 0) return null;
				const headingId = `tools-${category.id}`;

				return (
					<Fragment key={category.id}>
						{/* separator band, same as between sections on the tool pages */}
						<div
							aria-hidden
							className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
						/>
						<section
							aria-labelledby={headingId}
							className="border-stroke-soft-100 border-b dark:border-white/10"
						>
							<div className="flex items-end justify-between gap-6 border-stroke-soft-100 border-b px-4 py-6 sm:px-8 lg:px-12 dark:border-white/10">
								<div className="flex flex-col gap-1">
									<h2
										id={headingId}
										className="font-medium text-[18px] text-text-strong-950 tracking-tight sm:text-[20px] dark:text-white"
									>
										{category.title}
									</h2>
									<p className="text-[13.5px] text-text-sub-600 leading-relaxed sm:text-[14px] dark:text-white/60">
										{category.description}
									</p>
								</div>
								<span className="hidden shrink-0 text-[13px] text-text-sub-600 tabular-nums sm:block dark:text-white/50">
									{tools.length} {tools.length === 1 ? "tool" : "tools"}
								</span>
							</div>

							{/* Cells draw right and bottom hairlines; clipping 1px hides the outer ones. */}
							<div className="overflow-hidden">
								<ul className="-mr-px -mb-px grid grid-cols-1 sm:grid-cols-2">
									{tools.map((tool) => (
										<ToolCard key={tool.path} tool={tool} />
									))}
								</ul>
							</div>
						</section>
					</Fragment>
				);
			})}

			<div
				aria-hidden
				className="h-24 border-stroke-soft-100 border-b dark:border-white/10"
			/>
		</section>
	);
}
