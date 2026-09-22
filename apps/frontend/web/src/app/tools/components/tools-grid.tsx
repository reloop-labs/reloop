import { cn } from "@reloop/ui/cn";
import {
	Activity,
	AlertTriangle,
	ArrowRight,
	BadgeCheck,
	Ban,
	Calendar,
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
import { ApiBlueprintArt } from "./art/api-art";
import { AuthBlueprintArt } from "./art/auth-art";
import { BimiBlueprintArt } from "./art/bimi-art";
import { BlocklistBlueprintArt } from "./art/blocklist-art";
import { DeliverabilityBlueprintArt } from "./art/deliverability-art";
import { DnsBlueprintArt } from "./art/dns-art";
import { DomainAgeBlueprintArt } from "./art/domain-age-art";
import { HtmlEditorBlueprintArt } from "./art/html-editor-art";
import { LookalikeBlueprintArt } from "./art/lookalike-art";
import { ReputationBlueprintArt } from "./art/reputation-art";
import { SpamWordsBlueprintArt } from "./art/spam-words-art";
import { SpoofBlueprintArt } from "./art/spoof-art";
import { SuggestBlueprintArt } from "./art/suggest-art";
import { TempTimerIcon } from "./art/temp-timer-icon";
import { TempEmailTimerArt } from "./art/timer-art";
import { ValidatorBlueprintArt } from "./art/validator-art";
import { WhoSendsBlueprintArt } from "./art/who-sends-art";

export type ToolItem = {
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
	path: string;
	/** Render the full blueprint art panel instead of the icon box. */
	art?: "timer" | "validator" | "deliverability" | "spoof" | "blocklist" | "dns" | "domain-age" | "who-sends" | "auth" | "reputation" | "lookalike" | "spam-words" | "bimi" | "html-editor" | "api" | "suggest";
};

export const ALL_TOOLS: ToolItem[] = [
	{
		title: "Free Email Validator & List Cleaner",
		description:
			"Verify syntax, disposable domains, and active MX records to keep your email list clean.",
		icon: MailCheck,
		path: "/tools/email-validator",
		art: "validator",
	},
	{
		title: "Email Deliverability & Spam Tester",
		description:
			"Send a test email to analyze inbox placement, spam score, and SPF/DKIM alignment.",
		icon: Send,
		path: "/tools/deliverability-tester",
		art: "deliverability",
	},
	{
		title: "Email Spoofing & Phishing Checker",
		description:
			"Test whether unauthorized senders can forge your domain to deliver phishing emails.",
		icon: ShieldAlert,
		path: "/tools/spoof-checker",
		art: "spoof",
	},
	{
		title: "IP & Domain DNS Blocklist Checker",
		description:
			"Check your sending IP address and domain against 50+ public DNS blocklists in real time.",
		icon: Ban,
		path: "/tools/blocklist-checker",
		art: "blocklist",
	},
	{
		title: "DNS Lookup & Record Analyzer",
		description:
			"Inspect MX, SPF, DKIM, DMARC, and A records with syntax validation and live diagnostics.",
		icon: Globe,
		path: "/tools/dns-lookup",
		art: "dns",
	},
	{
		title: "Domain Age & Warmup Checker",
		description:
			"Check domain registration age and warmup safety to avoid cold-sending spam filters.",
		icon: Calendar,
		path: "/tools/domain-age",
		art: "domain-age",
	},
	{
		title: "Domain ESP & Email Sender Lookup",
		description:
			"Identify all third-party email service providers authorized to send from your domain.",
		icon: Search,
		path: "/tools/who-sends",
		art: "who-sends",
	},
	{
		title: "SPF, DKIM & DMARC Checker",
		description:
			"Validate email authentication records to guarantee proper sender alignment and security.",
		icon: ShieldCheck,
		path: "/tools/auth-checker",
		art: "auth",
	},
	{
		title: "Temp & Disposable Email Checker",
		description:
			"Detect throwaway inboxes and burner addresses before they bounce or skew signup metrics.",
		icon: TempTimerIcon,
		path: "/tools/temp-email-checker",
		art: "timer",
	},
	{
		title: "Domain Reputation & Health Checker",
		description:
			"Evaluate your domain health score, spam placement risk, and mail configuration flaws.",
		icon: Activity,
		path: "/tools/domain-reputation-checker",
		art: "reputation",
	},
	{
		title: "Lookalike Domain & Phishing Scanner",
		description:
			"Detect registered typosquats and lookalike domains impersonating your brand online.",
		icon: Eye,
		path: "/tools/lookalike-watch",
		art: "lookalike",
	},
	{
		title: "Email Spam Words & Subject Checker",
		description:
			"Scan subject lines and body copy for spam trigger words that hurt inbox deliverability.",
		icon: AlertTriangle,
		path: "/tools/email-spam-words-checker",
		art: "spam-words",
	},
	{
		title: "BIMI & Brand Avatar Checker",
		description:
			"Verify your BIMI DNS record and SVG logo to display verified brand avatars in inboxes.",
		icon: BadgeCheck,
		path: "/tools/bimi-checker",
		art: "bimi",
	},
	{
		title: "Email HTML Template Editor",
		description:
			"Design, edit, and preview responsive HTML email templates across mobile and desktop.",
		icon: Code2,
		path: "/tools/email-html-editor",
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

const TOOL_ART = {
	timer: TempEmailTimerArt,
	validator: ValidatorBlueprintArt,
	deliverability: DeliverabilityBlueprintArt,
	spoof: SpoofBlueprintArt,
	blocklist: BlocklistBlueprintArt,
	dns: DnsBlueprintArt,
	"domain-age": DomainAgeBlueprintArt,
	"who-sends": WhoSendsBlueprintArt,
	auth: AuthBlueprintArt,
	reputation: ReputationBlueprintArt,
	lookalike: LookalikeBlueprintArt,
	"spam-words": SpamWordsBlueprintArt,
	bimi: BimiBlueprintArt,
	"html-editor": HtmlEditorBlueprintArt,
	api: ApiBlueprintArt,
	suggest: SuggestBlueprintArt,
} as const;

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
								"group flex flex-col justify-between border-stroke-soft-100 px-4 py-6 transition-colors hover:bg-neutral-50/70 sm:px-6 sm:py-7 lg:px-7 lg:py-8 dark:border-white/10 dark:hover:bg-white/[0.02]",
								borderClass,
							)}
						>
						<div>
							{tool.art ? (
								<div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-[#246BF5] text-white dark:border dark:border-white/10 dark:bg-[#000]">
									{(() => {
										const Art = TOOL_ART[tool.art];
										return (
											<Art
												className={
													tool.art === "timer" || tool.art === "bimi"
														? "h-full"
														: "h-full w-auto"
												}
											/>
										);
									})()}
								</div>
							) : (
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
									<IconComponent className="h-5 w-5 stroke-[1.75]" />
								</div>
							)}

								<div className="mt-5 flex items-start gap-2.5">
									<span
										className="mt-1 h-3.5 w-[2px] shrink-0 rounded-full bg-blue-600 dark:bg-blue-500"
										aria-hidden="true"
									/>
									<h3 className="font-semibold text-[15px] text-text-strong-950 leading-snug tracking-tight transition-colors group-hover:text-blue-600 sm:text-[15.5px] dark:text-white dark:group-hover:text-blue-400">
										{tool.title}
									</h3>
								</div>

								<p className="mt-2.5 line-clamp-2 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
									{tool.description}
								</p>
							</div>

							<div className="mt-5 flex items-center gap-1.5 font-medium text-[13px] text-blue-600 dark:text-blue-400">
								<span>Try now</span>
								<ArrowRight className="h-3.5 w-3.5" />
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
