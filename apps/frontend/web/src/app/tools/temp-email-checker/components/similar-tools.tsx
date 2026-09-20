import { cn } from "@reloop/ui/cn";
import {
	Ban,
	Calendar,
	Globe,
	MailCheck,
	Search,
	Send,
	ShieldAlert,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

type SimilarToolItem = {
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
	path: string;
};

const SIMILAR_TOOLS: SimilarToolItem[] = [
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

export function SimilarTools() {
	return (
		<section
			id="similar-tools"
			aria-labelledby="similar-tools-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] uppercase">
					<span className="text-primary-base">04.</span>{" "}
					<span className="text-text-sub-600 dark:text-white/50">
						Similar tools
					</span>
				</p>
				<h2
					id="similar-tools-heading"
					className="text-balance font-semibold text-2xl text-text-strong-950 tracking-[-0.025em] sm:text-3xl lg:text-[2rem] lg:leading-[1.15] dark:text-white"
				>
					Explore more <span className="text-primary-base">free tools</span>{" "}
					like Temp Email Checker
				</h2>
				<p className="mt-4 max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					Validate, inspect, and test every part of your email setup. Free, no
					signup required.
				</p>
			</div>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{SIMILAR_TOOLS.map((tool, index) => {
					const IconComponent = tool.icon;
					const borderClass = getBorderClass(index, SIMILAR_TOOLS.length);

					return (
						<Link
							key={tool.title}
							href={tool.path}
							className={cn(
								"group flex flex-col border-stroke-soft-100 px-4 py-6 transition-colors hover:bg-neutral-50/70 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10 dark:hover:bg-white/[0.02]",
								borderClass,
							)}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary-base transition-transform group-hover:scale-105 dark:bg-blue-950/40 dark:text-blue-400">
								<IconComponent className="h-5 w-5 stroke-[1.75]" />
							</div>

							<div className="mt-6 flex items-center gap-2">
								<span
									className="h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base transition-all group-hover:h-4"
									aria-hidden="true"
								/>
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight transition-colors group-hover:text-primary-base sm:text-[16px] dark:text-white dark:group-hover:text-blue-400">
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
