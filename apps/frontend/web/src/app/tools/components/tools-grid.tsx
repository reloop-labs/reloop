import { cn } from "@reloop/ui/cn";
import {
	Activity,
	AlertTriangle,
	BadgeCheck,
	Ban,
	Calendar,
	Clock,
	Code2,
	Eye,
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
import type { ComponentType } from "react";

export type ToolItem = {
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
	path: string;
};

export const ALL_TOOLS: ToolItem[] = [
	{
		title: "Free Email Validator",
		description:
			"Verify syntax, disposable domains, role addresses, and active MX records for single addresses or bulk CSV lists.",
		icon: MailCheck,
		path: "/tools/email-validator",
	},
	{
		title: "Email Deliverability Tester",
		description:
			"Send a test email to get a full spam score, diagnostic report on SPF, DKIM, and DMARC alignment, and blacklist checks.",
		icon: Send,
		path: "/tools/deliverability-tester",
	},
	{
		title: "Can Anyone Spoof My Domain?",
		description:
			"Instant check on whether Gmail, Yahoo, and Outlook will deliver unauthorized spoofed emails using your domain.",
		icon: ShieldAlert,
		path: "/tools/spoof-checker",
	},
	{
		title: "IP & Domain DNS Blocklist Checker",
		description:
			"Look up any sending IP address or domain name against 50+ public DNS blocklists to ensure your mail isn't blocked.",
		icon: Ban,
		path: "/tools/blocklist-checker",
	},
	{
		title: "DNS Lookup & Record Analyzer",
		description:
			"Inspect MX, SPF, DKIM, DMARC, and A records in real-time with comprehensive diagnostics and syntax validation.",
		icon: Globe,
		path: "/tools/dns-lookup",
	},
	{
		title: "Domain Age & Warmup Checker",
		description:
			"Calculate domain age, registration history, and warmup readiness to prevent deliverability issues on fresh domains.",
		icon: Calendar,
		path: "/tools/domain-age",
	},
	{
		title: "Who Sends Email From This Domain?",
		description:
			"Audit SPF records and inbound mail headers to identify all third-party services authorized to send from your domain.",
		icon: Search,
		path: "/tools/who-sends",
	},
	{
		title: "SPF, DKIM & DMARC Checker",
		description:
			"Validate email authentication records for your domain to ensure proper alignment and prevent unauthorized senders.",
		icon: ShieldCheck,
		path: "/tools/auth-checker",
	},
	{
		title: "Temp & Disposable Email Checker",
		description:
			"Check syntax, known disposable providers, role prefixes, free webmail domains, and MX records before sending.",
		icon: Clock,
		path: "/tools/temp-email-checker",
	},
	{
		title: "Domain Reputation Checker",
		description:
			"Evaluate your sending domain reputation with real-time health score, spam placement risks, and configuration audits.",
		icon: Activity,
		path: "/tools/domain-reputation-checker",
	},
	{
		title: "Lookalike Domain Watch & Phish Scanner",
		description:
			"Discover registered domain twins, typosquats, and lookalikes impersonating your brand before attackers strike.",
		icon: Eye,
		path: "/tools/lookalike-watch",
	},
	{
		title: "Email Spam Words Checker",
		description:
			"Scan email subject lines and copy for trigger words, spam patterns, and formatting issues that hurt inbox delivery.",
		icon: AlertTriangle,
		path: "/tools/email-spam-words-checker",
	},
	{
		title: "BIMI Checker",
		description:
			"Validate your Brand Indicators for Message Identification record and SVG logo to display verified avatars in inboxes.",
		icon: BadgeCheck,
		path: "/tools/bimi-checker",
	},
	{
		title: "Email HTML Editor",
		description:
			"Create, edit, and preview responsive email HTML templates in real time across mobile and desktop viewports.",
		icon: Code2,
		path: "/tools/email-html-editor",
	},
	{
		title: "Developer Tools API",
		description:
			"Integrate syntax verification, DNS queries, and deliverability checks directly via our low-latency REST API.",
		icon: Terminal,
		path: "/docs/api",
	},
	{
		title: "Suggest a Tool",
		description:
			"Need an email or DNS utility that isn't listed here? Suggest a tool and we'll build it for the community.",
		icon: Sparkles,
		path: "/contact",
	},
];

function getBorderClass(index: number, total: number) {
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

export function ToolsGrid() {
	return (
		<section
			id="tools-list"
			aria-label="All Free Developer Tools"
			className="w-full"
		>
			<div className="grid grid-cols-1 border-stroke-soft-100 border-t border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{ALL_TOOLS.map((tool, index) => {
					const IconComponent = tool.icon;
					const borderClass = getBorderClass(index, ALL_TOOLS.length);

					return (
						<Link
							key={tool.title}
							href={tool.path}
							className={cn(
								"group flex flex-col border-stroke-soft-100 px-4 py-6 transition-colors hover:bg-neutral-50/70 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10 dark:hover:bg-white/[0.02]",
								borderClass,
							)}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-105 dark:bg-blue-950/40 dark:text-blue-400">
								<IconComponent className="h-5 w-5 stroke-[1.75]" />
							</div>

							<div className="mt-6 flex items-center gap-2">
								<span
									className="h-3.5 w-[2px] shrink-0 rounded-full bg-blue-600 transition-all group-hover:h-4 dark:bg-blue-500"
									aria-hidden="true"
								/>
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight transition-colors group-hover:text-blue-600 sm:text-[16px] dark:text-white dark:group-hover:text-blue-400">
									{tool.title}
								</h3>
							</div>

							<p className="mt-3 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
								{tool.description}
							</p>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
