"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import type { PlanId } from "@reloop/web/lib/pricing";
import {
	comparisonSections,
	formatPrice,
	getPlanPrice,
	pricingPlans,
} from "@reloop/web/lib/pricing";
import Link from "next/link";
import * as HoverCard from "@radix-ui/react-hover-card";
import { Fragment } from "react";

function PlanCtaLink({
	href,
	label,
	external,
	variant = "default",
	size = "medium",
}: {
	href: string;
	label: string;
	external?: boolean;
	variant?: "default" | "primary";
	size?: "medium" | "small" | "xsmall";
}) {
	const fancyVariant = variant === "primary" ? "primary" : "basic";
	const heightClass =
		size === "xsmall"
			? "h-7.5! px-3!"
			: size === "small"
				? "h-8.5! px-4!"
				: "h-11! px-6!";
	const textSizeClass =
		size === "xsmall"
			? "text-[12px]"
			: size === "small"
				? "text-[13px]"
				: "text-[14px]";

	const content = (
		<span className={cn("font-medium", textSizeClass)}>{label}</span>
	);

	if (external) {
		return (
			<FancyButton.Root
				asChild
				variant={fancyVariant}
				size={size}
				className={cn("w-full! rounded-full!", heightClass)}
			>
				<a href={href} target="_blank" rel="noopener noreferrer">
					{content}
				</a>
			</FancyButton.Root>
		);
	}

	return (
		<FancyButton.Root
			asChild
			variant={fancyVariant}
			size={size}
			className={cn("w-full! rounded-full!", heightClass)}
		>
			<Link href={href}>{content}</Link>
		</FancyButton.Root>
	);
}

function getFeatureIcon(feature: string, customClassName?: string) {
	const key = feature.toLowerCase().trim();
	const className =
		customClassName ??
		"mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40";

	if (key.includes("all ") && key.includes("features")) {
		return (
			<Icon
				name="sparkling"
				className={
					customClassName
						? className
						: "mt-0.5 size-4 shrink-0 text-primary-base"
				}
			/>
		);
	}
	if (
		key.includes("retention") ||
		key.includes("database") ||
		key.includes("export")
	) {
		return <Icon name="database" className={className} />;
	}
	if (key.includes("day") || key.includes("limit")) {
		return <Icon name="limit" className={className} />;
	}
	if (
		key.includes("monthly emails") ||
		(key.includes("email") && (key.includes("month") || key.includes("volume")))
	) {
		return <Icon name="mail-single" className={className} />;
	}
	if (key.includes("inbound")) {
		return <Icon name="mail-receive" className={className} />;
	}
	if (key.includes("human inbox")) {
		return (
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={className}
			>
				<path
					opacity="0.12"
					d="M21.5148 15.9403L21.9999 14H18.7126C18.0864 14 17.7734 14 17.4892 14.0863C17.2376 14.1627 17.0036 14.288 16.8004 14.4549C16.571 14.6435 16.3974 14.904 16.05 15.425L16.05 15.425L15.95 15.575L15.95 15.575C15.6026 16.096 15.429 16.3565 15.1996 16.5451C14.9964 16.712 14.7624 16.8373 14.5108 16.9137C14.2266 17 13.9136 17 13.2874 17H10.7126C10.0864 17 9.77338 17 9.4892 16.9137C9.23762 16.8373 9.00357 16.712 8.80045 16.5451C8.57101 16.3565 8.39735 16.096 8.05003 15.575L8.05003 15.575L7.94997 15.425C7.60265 14.904 7.42899 14.6435 7.19955 14.4549C6.99643 14.288 6.76238 14.1627 6.5108 14.0863C6.22662 14 5.91355 14 5.28741 14H1.99988L2.48495 15.9403C3.02661 18.1069 3.29745 19.1903 3.90143 19.9969C4.43433 20.7086 5.14737 21.2653 5.96706 21.6097C6.89608 22 8.01275 22 10.2461 22H13.7537C15.987 22 17.1037 22 18.0327 21.6097C18.8524 21.2653 19.5654 20.7086 20.0983 19.9969C20.7023 19.1903 20.9731 18.107 21.5148 15.9403L21.5148 15.9403Z"
					fill="currentColor"
				/>
				<path
					d="M15.5002 3H16.0002C17.7714 3 19.3235 4.18549 19.7895 5.8943L21.0335 10.4561C21.1739 10.9708 21.2441 11.2282 21.3021 11.4846C21.6773 13.1435 21.6956 14.8632 21.3557 16.5297C21.3032 16.7873 21.2385 17.046 21.1091 17.5636C20.9549 18.1802 20.8779 18.4885 20.7781 18.7547C20.1188 20.5137 18.5293 21.7548 16.6629 21.9678C16.3804 22 16.0627 22 15.4271 22H8.57279C7.93734 22 7.61961 22 7.33717 21.9678C5.47072 21.7549 3.88112 20.5137 3.22188 18.7547C3.12212 18.4885 3.04506 18.1802 2.89093 17.5637C2.76155 17.0462 2.69686 16.7874 2.64434 16.5299C2.30445 14.8633 2.32275 13.1434 2.69804 11.4844C2.75603 11.228 2.82622 10.9707 2.96659 10.456L4.21076 5.89428C4.67683 4.18547 6.22892 3 8.00015 3H8.50015M2.50024 14H5.2875C5.91365 14 6.22672 14 6.51089 14.0863C6.76247 14.1627 6.99652 14.288 7.19964 14.4549C7.42908 14.6435 7.60274 14.904 7.95006 15.425L8.05012 15.575C8.39744 16.096 8.5711 16.3565 8.80054 16.5451C9.00366 16.712 9.23771 16.8373 9.48929 16.9137C9.77347 17 10.0865 17 10.7127 17H13.2875C13.9136 17 14.2267 17 14.5109 16.9137C14.7625 16.8373 14.9965 16.712 15.1996 16.5451C15.4291 16.3565 15.6027 16.096 15.9501 15.575L16.0501 15.425C16.3974 14.904 16.5711 14.6435 16.8005 14.4549C17.0037 14.288 17.2377 14.1627 17.4893 14.0863C17.7735 14 18.0865 14 18.7127 14H21.5002M9.00024 8L12.0002 11L15.0002 8M12.0002 11V2"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		);
	}
	if (key.includes("inbox") || key.includes("agent")) {
		return <Icon name="agent" className={className} />;
	}
	if (key.includes("webhook")) {
		return <Icon name="webhook" className={className} />;
	}
	if (key.includes("domain")) {
		return <Icon name="globe" className={className} />;
	}
	if (key.includes("transactional") || key.includes("campaign")) {
		return <Icon name="mega-phone" className={className} />;
	}
	if (key.includes("smtp")) {
		return <Icon name="smtp" className={className} />;
	}
	if (key.includes("reputation")) {
		return <Icon name="monitor" className={className} />;
	}
	if (key.includes("delivery")) {
		return <Icon name="delivery-analytics" className={className} />;
	}
	if (key.includes("analytics") || key.includes("tracking")) {
		return <Icon name="graph-up" className={className} />;
	}
	if (key.includes("uptime") || key.includes("sla guarantee")) {
		return <Icon name="headset" className={className} />;
	}
	if (key.includes("support") || key.includes("sla")) {
		return <Icon name="support-level" className={className} />;
	}
	if (key.includes("attachment")) {
		return <Icon name="paperclip" className={className} />;
	}
	if (
		key.includes("overage") ||
		key.includes("pricing") ||
		key.includes("invoice")
	) {
		return <Icon name="invoice" className={className} />;
	}
	if (
		key.includes("throughput") ||
		key.includes("second") ||
		key.includes("warmup")
	) {
		return <Icon name="zap" className={className} />;
	}
	if (
		key.includes("spf") ||
		key.includes("dkim") ||
		key.includes("dmarc") ||
		key.includes("auth") ||
		key.includes("validation")
	) {
		return <Icon name="shield" className={className} />;
	}
	if (key.includes("pristine") || key.includes("shared ip")) {
		return <Icon name="share" className={className} />;
	}
	if (key.includes("dedicated ip") || key.includes("ip")) {
		return <Icon name="dedicated-ip" className={className} />;
	}
	if (key.includes("relay") || key.includes("server")) {
		return <Icon name="mail-server" className={className} />;
	}
	if (key.includes("audit")) {
		return <Icon name="audit-logs" className={className} />;
	}
	if (key.includes("security") || key.includes("lock")) {
		return <Icon name="lock" className={className} />;
	}
	if (key.includes("rest api") || key.includes("api") || key.includes("cli")) {
		return <Icon name="api" className={className} />;
	}
	if (key.includes("scheduled") || key.includes("calendar")) {
		return <Icon name="calendar" className={className} />;
	}
	if (key.includes("template") || key.includes("log") || key.includes("file")) {
		return <Icon name="file-text" className={className} />;
	}
	if (key.includes("sdk") || key.includes("workflow")) {
		return <Icon name="workflow" className={className} />;
	}
	if (key.includes("hosted")) {
		return <Icon name="reloop" className={className} />;
	}
	if (key.includes("self-host")) {
		return <Icon name="home" className={className} />;
	}
	if (key.includes("integration") || key.includes("component")) {
		return <Icon name="grid" className={className} />;
	}
	if (key.includes("spam")) {
		return <Icon name="alert-triangle" className={className} />;
	}

	return <Icon name="sparkling" className={className} />;
}

function getSectionIcon(section: string, customClassName?: string) {
	const key = section.toLowerCase().trim();
	const className =
		customClassName ??
		"size-4 shrink-0 text-text-strong-950 dark:text-white";

	if (key.includes("volume")) {
		return <Icon name="mail-single" className={className} />;
	}
	if (key.includes("resource")) {
		return <Icon name="database" className={className} />;
	}
	if (key.includes("api")) {
		return <Icon name="api" className={className} />;
	}
	if (key.includes("inbox") || key.includes("ai")) {
		return <Icon name="sparkling" className={className} />;
	}
	if (key.includes("deliver")) {
		return <Icon name="shield" className={className} />;
	}
	if (key.includes("analytic")) {
		return <Icon name="graph-up" className={className} />;
	}
	if (key.includes("platform")) {
		return <Icon name="grid" className={className} />;
	}
	if (key.includes("support")) {
		return <Icon name="headset" className={className} />;
	}
	if (key.includes("security") || key.includes("compliance")) {
		return <Icon name="lock" className={className} />;
	}
	return <Icon name="sparkling" className={className} />;
}

const FEATURE_TOOLTIPS: Record<
	string,
	{
		description: string;
		version?: string;
		badge?: string;
		status?: string;
	}
> = {
	monthlyEmails: {
		description:
			"Total volume of emails you can deliver per monthly billing cycle across all domains and APIs.",
		version: "v3.0",
		badge: "LIVE",
		status: "CORE",
	},
	dailyLimit: {
		description:
			"Maximum number of emails you can dispatch within a rolling 24-hour window.",
		version: "v2.4",
		badge: "LIMIT",
		status: "RATE",
	},
	overage: {
		description:
			"Low-cost pay-as-you-go rate for emails sent beyond your plan's monthly allocation.",
		version: "v1.0",
		badge: "AUTO",
		status: "USAGE",
	},
	agentInbox: {
		description:
			"Dedicated AI-driven mailboxes that process incoming messages and execute autonomous workflows.",
		version: "v3.0",
		badge: "LIVE",
		status: "AGENT",
	},
	webhooks: {
		description:
			"Real-time HTTP callbacks for message events such as delivered, opened, clicked, and bounced.",
		version: "v2.0",
		badge: "READY",
		status: "REALTIME",
	},
	customDomains: {
		description:
			"Send and receive emails from your own branded domain with automated DNS verification.",
		version: "v1.2",
		badge: "ACTIVE",
		status: "VERIFIED",
	},
	attachmentSize: {
		description:
			"Maximum allowable file size per email attachment sent through REST API or SMTP.",
		version: "v2.1",
		badge: "LIMIT",
		status: "ASSETS",
	},
	dataRetention: {
		description:
			"Duration that email payloads, attachments, and transmission logs are stored in your dashboard.",
		version: "v2.0",
		badge: "SECURE",
		status: "STORAGE",
	},
	restApi: {
		description:
			"Fast, developer-friendly REST API for sending transactional emails, templates, and analytics.",
		version: "v1.0",
		badge: "REST",
		status: "HTTPS",
	},
	smtpRelay: {
		description:
			"Standard SMTP endpoint credentials compatible with WordPress, Rails, Django, and legacy servers.",
		version: "v1.0",
		badge: "SMTP",
		status: "PORT 587",
	},
	scheduledEmails: {
		description:
			"Queue emails to be automatically dispatched at an exact future timestamp or timezone.",
		version: "v2.0",
		badge: "QUEUE",
		status: "CRON",
	},
	emailTemplates: {
		description:
			"Reusable, version-controlled HTML and React email templates with dynamic variable interpolation.",
		version: "v2.2",
		badge: "REACT",
		status: "PREVIEW",
	},
	officialSdks: {
		description:
			"Official client libraries with full TypeScript types, auto-complete, and error handling.",
		version: "v3.0",
		badge: "NPM",
		status: "TYPED",
	},
	agentInboxFeature: {
		description:
			"Autonomous mailboxes that summarize incoming emails, trigger tools, and draft human-grade replies.",
		version: "v3.0",
		badge: "LIVE",
		status: "AI AGENT",
	},
	inboundEmail: {
		description:
			"Receive incoming emails, parse headers and attachments, and route them to webhooks or AI pipelines.",
		version: "v2.0",
		badge: "INBOUND",
		status: "MX ROUTE",
	},
	aiComposer: {
		description:
			"AI-assisted email drafting and formatting that optimizes tone, clarity, and subject lines.",
		version: "v3.0",
		badge: "AI",
		status: "SMART",
	},
	humanInbox: {
		description:
			"Collaborative inbox for team members to triage threads, review AI drafts, and reply directly.",
		version: "v2.1",
		badge: "TEAM",
		status: "SHARED",
	},
	emailAuth: {
		description:
			"Automated verification of SPF, DKIM, and DMARC DNS records to maximize mailbox inbox placement.",
		version: "v1.0",
		badge: "AUTH",
		status: "PASSED",
	},
	pristineSharedIps: {
		description:
			"Pre-warmed, reputation-monitored IP pools reserved for high deliverability senders.",
		version: "v1.0",
		badge: "WARMED",
		status: "PRISTINE",
	},
	dedicatedIp: {
		description:
			"Dedicated IP addresses with automated warmup schedules reserved exclusively for your domain.",
		version: "v1.0",
		badge: "ISOLATED",
		status: "DEDICATED",
	},
	spamTesting: {
		description:
			"Pre-send spam score analysis and content checking against major spam filter engines.",
		version: "v2.0",
		badge: "CHECK",
		status: "OPTIMAL",
	},
	reputationMonitoring: {
		description:
			"Continuous real-time tracking of domain reputation, blacklist listings, and complaint rates.",
		version: "v2.4",
		badge: "HEALTH",
		status: "99.9%",
	},
	deliveryAnalytics: {
		description:
			"Granular delivery reports with bounce categorization, latency metrics, and failure diagnostics.",
		version: "v2.0",
		badge: "METRICS",
		status: "ANALYTICS",
	},
	openClickTracking: {
		description:
			"Privacy-first engagement tracking for unique email opens and individual link clicks.",
		version: "v1.5",
		badge: "TRACK",
		status: "ENGAGE",
	},
	eventLogs: {
		description:
			"Live event stream of every dispatch, delivery attempt, bounce, and open with raw JSON payloads.",
		version: "v2.0",
		badge: "STREAM",
		status: "REALTIME",
	},
	exportRetention: {
		description:
			"Export message logs and performance analytics to CSV or stream directly to your data warehouse.",
		version: "v1.0",
		badge: "SYNC",
		status: "EXPORT",
	},
	hostedReloop: {
		description:
			"Fully managed cloud infrastructure with automatic scaling, DDoS mitigation, and global distribution.",
		version: "v3.0",
		badge: "CLOUD",
		status: "MANAGED",
	},
	selfHost: {
		description:
			"Run the complete Reloop email engine on your own private cloud, Docker, or Kubernetes clusters.",
		version: "v1.0",
		badge: "DOCKER",
		status: "OPEN",
	},
	integrations: {
		description:
			"Connect Reloop with Slack, Linear, GitHub, Segment, Zapier, and custom webhooks.",
		version: "v2.0",
		badge: "APPS",
		status: "NATIVE",
	},
	auditLogs: {
		description:
			"Comprehensive audit logging tracking all administrative actions, API key usage, and setting changes.",
		version: "v1.2",
		badge: "AUDIT",
		status: "COMPLIANT",
	},
	support: {
		description:
			"Expert email and chat support with direct access to deliverability and infrastructure engineers.",
		version: "v1.0",
		badge: "SLA",
		status: "24/7",
	},
	uptimeSla: {
		description:
			"Financially-backed 99.99% service level agreement guaranteeing high platform availability.",
		version: "v1.0",
		badge: "99.99%",
		status: "SLA",
	},
};

function FeatureTooltipContent({
	label,
	rowKey,
}: {
	label: string;
	rowKey: string;
}) {
	const info = FEATURE_TOOLTIPS[rowKey] ?? {
		description: `Comprehensive features and infrastructure controls for ${label}.`,
	};

	return (
		<div className="w-[280px] rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#121212] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
			<div className="flex items-center gap-2">
				{getFeatureIcon(
					label,
					"size-4 shrink-0 text-blue-accent dark:text-[#52a8ff]",
				)}
				<h4 className="font-medium text-[14px] text-text-strong-950 dark:text-white">
					{label}
				</h4>
			</div>
			<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/70">
				{info.description}
			</p>
		</div>
	);
}

function PlanColumn({
	plan,
	index,
	recommended,
}: {
	plan: (typeof pricingPlans)[number];
	index: number;
	recommended: boolean;
}) {
	const price = getPlanPrice(plan);
	const isCustom = price === null;

	const borderClasses = [
		"border-b sm:border-r sm:border-b lg:border-r lg:border-b-0",
		"border-b sm:border-r-0 sm:border-b lg:border-r lg:border-b-0",
		"border-b sm:border-r sm:border-b-0 lg:border-r lg:border-b-0",
		"border-b-0 sm:border-b-0 sm:border-r-0 lg:border-r-0 lg:border-b-0",
	][index];

	return (
		<div
			className={cn(
				"flex min-h-[440px] flex-col border-stroke-soft-100 p-6 pb-5 sm:min-h-[460px] sm:p-8 sm:pb-6 lg:p-6 lg:pb-5 xl:p-8 xl:pb-6 dark:border-white/[0.07]",
				borderClasses,
				recommended && "bg-bg-weak-50 dark:bg-white/[0.03]",
			)}
		>
			<div>
				<div className="flex h-6 items-center justify-between gap-2">
					<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
						{plan.name}
					</h3>
					{recommended && (
						<span className="relative shrink-0 overflow-hidden rounded-full bg-primary-base px-2 py-0.5 text-center font-semibold text-[10px] text-white uppercase tracking-[0.14em] shadow-fancy-buttons-primary before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-static-white before:to-transparent before:opacity-[.16]">
							{plan.badge ?? "Recommended"}
						</span>
					)}
				</div>

				<div className="mt-6 h-8">
					{isCustom ? (
						<p className="font-semibold text-[2rem] text-text-strong-950 leading-none tracking-tight dark:text-white">
							Custom
						</p>
					) : (
						<div className="flex items-end gap-1">
							<span className="font-semibold text-[2rem] text-text-strong-950 leading-none tracking-tight dark:text-white">
								{formatPrice(price)}
							</span>
							{price > 0 && (
								<span className="mb-1 text-[15px] text-text-sub-600 dark:text-white/50">
									{plan.priceSubline}
								</span>
							)}
						</div>
					)}
				</div>
			</div>

			<div
				aria-hidden
				className="-mx-6 sm:-mx-8 lg:-mx-6 xl:-mx-8 mt-6 border-stroke-soft-100 border-t dark:border-white/[0.07]"
			/>

			<div className="flex h-[100px] flex-col justify-center py-4">
				<p
					className={cn(
						"text-[14px]",
						!isCustom && price > 0
							? "font-medium text-text-strong-950 dark:text-white"
							: "text-text-sub-600 dark:text-white/55",
					)}
				>
					{isCustom || price === 0 ? plan.priceSubline : plan.emailsLabel}
				</p>
				{plan.extraEmailsLabel && (
					<p className="mt-0.5 text-[12px] text-text-sub-600 dark:text-white/50">
						{plan.extraEmailsLabel}
					</p>
				)}
			</div>

			<div
				aria-hidden
				className="-mx-6 sm:-mx-8 lg:-mx-6 xl:-mx-8 border-stroke-soft-100 border-t dark:border-white/[0.07]"
			/>

			<div
				className={cn(
					"flex flex-col gap-3 py-6",
					plan.secondaryCta && "sm:flex-row sm:items-center",
				)}
			>
				<PlanCtaLink
					href={plan.ctaHref}
					label={plan.ctaLabel}
					external={plan.ctaExternal}
					variant={recommended ? "primary" : "default"}
				/>
				{plan.secondaryCta && (
					<PlanCtaLink
						href={plan.secondaryCta.href}
						label={plan.secondaryCta.label}
						external={plan.secondaryCta.external}
					/>
				)}
			</div>

			<div
				aria-hidden
				className="-mx-6 sm:-mx-8 lg:-mx-6 xl:-mx-8 border-stroke-soft-100 border-t dark:border-white/[0.07]"
			/>

			<ul className="flex-1 space-y-1.5 pt-6">
				{plan.features.map((feature) => (
					<li
						key={feature}
						className="flex min-h-[24px] items-center gap-3 text-[14px] leading-snug"
					>
						{getFeatureIcon(feature)}
						<span className="text-text-sub-600 dark:text-white/60">
							{feature}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function PlanCheckmark({ className }: { className?: string }) {
	return (
		<svg
			fill="none"
			height="20"
			viewBox="0 0 20 20"
			width="20"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("text-primary-base dark:text-[#7aa2ff]", className)}
			style={
				{
					"--color-blue-accent": "currentColor",
				} as React.CSSProperties
			}
			aria-label="Included"
			role="img"
		>
			<circle
				cx="10"
				cy="10"
				fill="var(--color-blue-accent)"
				fillOpacity="0.08"
				r="8"
			/>
			<path
				d="M7 10.5L9 12.5L13 7.5"
				stroke="var(--color-blue-accent)"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.25"
			/>
		</svg>
	);
}

function PlanCrossIcon({ className }: { className?: string }) {
	return (
		<svg
			fill="none"
			height="20"
			viewBox="0 0 20 20"
			width="20"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-label="Not included"
			role="img"
		>
			<path
				d="M7 7L13 13M13 7L7 13"
				stroke="#060606"
				strokeOpacity="0.37"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="dark:stroke-white dark:stroke-opacity-30"
			/>
		</svg>
	);
}

function ComparisonCell({
	value,
	type,
}: {
	value: string | boolean;
	type: "text" | "boolean";
}) {
	const unavailable =
		type === "boolean" ? !value : value === "—" || value === "-";

	if (unavailable) {
		return <PlanCrossIcon />;
	}

	if (type === "boolean") {
		return <PlanCheckmark />;
	}

	return (
		<span className="text-center text-[14px] text-text-strong-950 dark:text-white/85">
			{value as string}
		</span>
	);
}

function ComparePlanCta({
	plan,
	active,
}: {
	plan: (typeof pricingPlans)[number];
	active?: boolean;
}) {
	const content = (
		<span className="truncate font-medium text-[14px] tracking-[-0.01em]">
			{plan.ctaLabel}
		</span>
	);

	if (plan.ctaExternal) {
		return (
			<FancyButton.Root
				asChild
				variant={active ? "primary" : "basic"}
				size="medium"
				className="h-10! w-full! rounded-full! px-5!"
			>
				<a href={plan.ctaHref} target="_blank" rel="noopener noreferrer">
					{content}
				</a>
			</FancyButton.Root>
		);
	}

	return (
		<FancyButton.Root
			asChild
			variant={active ? "primary" : "basic"}
			size="medium"
			className="h-10! w-full! rounded-full! px-5!"
		>
			<Link href={plan.ctaHref}>{content}</Link>
		</FancyButton.Root>
	);
}

const COMPARISON_GRID_COLS =
	"grid-cols-[minmax(220px,1.45fr)_repeat(4,minmax(150px,1fr))]";

function ComparisonTable({
	recommendedPlanId,
}: {
	recommendedPlanId?: PlanId;
}) {
	const isRecommended = (plan: (typeof pricingPlans)[number]) =>
		recommendedPlanId ? plan.id === recommendedPlanId : !!plan.highlighted;

	return (
		<div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto lg:overflow-visible">
			<div
				className={cn(
					"grid w-full min-w-[920px] border-stroke-soft-100 border-t dark:border-white/10",
					COMPARISON_GRID_COLS,
				)}
			>
				{/* Header row — matches reference: eyebrow + title left, plan + pill CTA right */}
				<div className="sticky top-16 z-30 flex flex-col gap-3 border-stroke-soft-100 border-b bg-bg-white-0/95 px-5 py-7 backdrop-blur-md sm:px-7 lg:px-9 dark:border-white/10 dark:bg-black/95">
					<p className="font-medium text-[12px] text-primary-base uppercase">
						Features
					</p>
					<h2 className="font-medium text-text-strong-950 leading-none dark:text-white">
						Compare every plan
					</h2>
				</div>
				{pricingPlans.map((plan) => {
					const active = isRecommended(plan);
					return (
						<div
							key={plan.id}
							className={cn(
								"sticky top-16 z-30 flex flex-col justify-center gap-7 border-stroke-soft-100 border-b border-l px-5 py-7 sm:px-6 backdrop-blur-md dark:border-white/10",
								active
									? "bg-bg-weak-50/95 dark:bg-white/[0.05]"
									: "bg-bg-white-0/95 dark:bg-black/95",
							)}
						>
							<div className="flex items-center gap-2">
								<span className="font-medium text-[15px] text-text-strong-950 leading-none dark:text-white">
									{plan.name}
								</span>
								{active && (
									<span className="relative shrink-0 overflow-hidden rounded-full bg-primary-base px-2 py-0.5 text-center font-semibold text-[10px] text-white uppercase tracking-[0.14em] shadow-fancy-buttons-primary before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-static-white before:to-transparent before:opacity-[.16]">
										{plan.badge ?? "Recommended"}
									</span>
								)}
							</div>
							<ComparePlanCta plan={plan} active={active} />
						</div>
					);
				})}

				{/* Spacer row like in reference (empty hairline row) */}
				<div className="h-14 border-stroke-soft-100 border-b dark:border-white/10" />
				{pricingPlans.map((plan) => (
					<div
						key={`spacer-${plan.id}`}
						className={cn(
							"h-14 border-stroke-soft-100 border-b border-l dark:border-white/10",
							isRecommended(plan) && "bg-bg-weak-50/40 dark:bg-white/[0.02]",
						)}
					/>
				))}

				{comparisonSections.map((section, sectionIndex) => (
					<Fragment key={section.title}>
						{sectionIndex > 0 && (
							<>
								<div className="h-14 border-stroke-soft-100 border-b dark:border-white/10" />
								{pricingPlans.map((plan) => (
									<div
										key={`spacer-${section.title}-${plan.id}`}
										className={cn(
											"h-14 border-stroke-soft-100 border-b border-l dark:border-white/10",
											isRecommended(plan) &&
												"bg-bg-weak-50/40 dark:bg-white/[0.02]",
										)}
									/>
								))}
							</>
						)}
						<div
							className="flex items-center gap-2.5 border-stroke-soft-100 border-b px-5 pt-6 pb-3 sm:px-7 lg:px-9 dark:border-white/[0.07]"
						>
							{getSectionIcon(
								section.title,
								"size-4 shrink-0 text-text-strong-950 dark:text-white/80",
							)}
							<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
								{section.title}
							</span>
						</div>
						{pricingPlans.map((plan) => (
							<div
								key={`${section.title}-${plan.id}-title`}
								className={cn(
									"border-stroke-soft-100 border-b border-l pt-6 pb-3 dark:border-white/[0.07]",
									isRecommended(plan) &&
										"bg-bg-weak-50/40 dark:bg-white/[0.02]",
								)}
							/>
						))}
						{section.rows.map((row, rowIndex) => (
							<div
								key={row.key}
								className="group/row col-span-full grid grid-cols-subgrid"
							>
								<div
									className={cn(
										"flex min-h-[60px] items-center border-stroke-soft-100 border-b px-5 py-4 transition-colors duration-150 sm:px-7 lg:px-9 dark:border-white/[0.07]",
										"group-hover/row:bg-bg-weak-50/70 dark:group-hover/row:bg-white/[0.03]",
									)}
								>
									<HoverCard.Root openDelay={100} closeDelay={150}>
										<HoverCard.Trigger asChild>
											<span className="relative cursor-pointer text-body-default underline decoration-[8%] decoration-text-opaque-disabled decoration-wavy underline-offset-[25%] transition-colors duration-200 hover:decoration-blue-accent text-text-strong-950 dark:text-white">
												{row.label}
											</span>
										</HoverCard.Trigger>
										<HoverCard.Portal>
											<HoverCard.Content
												side="top"
												align="start"
												sideOffset={10}
												collisionPadding={16}
												className="z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-150 outline-none"
											>
												<FeatureTooltipContent
													label={row.label}
													rowKey={row.key}
												/>
											</HoverCard.Content>
										</HoverCard.Portal>
									</HoverCard.Root>
								</div>
								{pricingPlans.map((plan) => {
									const value = plan.comparison[row.key];
									const active = isRecommended(plan);
									return (
										<div
											key={plan.id}
											className={cn(
												"flex min-h-[60px] items-center justify-center border-stroke-soft-100 border-b border-l px-4 py-4 text-center transition-colors duration-150 dark:border-white/[0.07]",
												"group-hover/row:bg-bg-weak-50/70 dark:group-hover/row:bg-white/[0.03]",
												active &&
													"bg-bg-weak-50/40 group-hover/row:bg-bg-weak-50/90 dark:bg-white/[0.02] dark:group-hover/row:bg-white/[0.05]",
											)}
										>
											<ComparisonCell
												value={value as string | boolean}
												type={row.type}
											/>
										</div>
									);
								})}
							</div>
						))}
					</Fragment>
				))}
			</div>
		</div>
	);
}

export function PricingSection({
	recommendedPlanId,
}: {
	recommendedPlanId?: PlanId;
}) {
	const isRecommended = (plan: (typeof pricingPlans)[number]) =>
		recommendedPlanId ? plan.id === recommendedPlanId : !!plan.highlighted;
	return (
		<>
			<div className="-mx-4 sm:-mx-6 lg:-mx-8 border-stroke-soft-100 border-y sm:grid sm:grid-cols-2 lg:grid-cols-4 dark:border-white/[0.07]">
				{pricingPlans.map((plan, index) => (
					<PlanColumn
						key={plan.id}
						plan={plan}
						index={index}
						recommended={isRecommended(plan)}
					/>
				))}
			</div>
			<div className="mt-24">
				<ComparisonTable recommendedPlanId={recommendedPlanId} />
			</div>
		</>
	);
}
