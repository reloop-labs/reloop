"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { LoadingDot } from "@reloop/ui/loading-dot";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { productionSiteUrl } from "@reloop/web/lib/site";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
	type CheckStatus,
	type DomainReputationResponse,
	type ReputationGrade,
	ReputationRequestError,
	runDomainReputationCheck,
} from "./check-api";
import { toolPath } from "./content";
import {
	buildFixes,
	buildProviderReadiness,
	type Fix,
	MESSAGE_LEVEL_RULES,
	type ProviderReadiness,
	type TierResult,
} from "./fixes";

const PRESETS = ["stripe.com", "github.com", "reloop.sh", "paypal.com"];

const GRADE_TONE: Record<
	ReputationGrade,
	{ ring: string; text: string; chip: string }
> = {
	"A+": {
		ring: "stroke-emerald-500",
		text: "text-emerald-600 dark:text-emerald-400",
		chip: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400",
	},
	A: {
		ring: "stroke-emerald-500",
		text: "text-emerald-600 dark:text-emerald-400",
		chip: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400",
	},
	B: {
		ring: "stroke-sky-500",
		text: "text-sky-600 dark:text-sky-400",
		chip: "border-sky-500/20 bg-sky-500/[0.08] text-sky-600 dark:text-sky-400",
	},
	C: {
		ring: "stroke-amber-500",
		text: "text-amber-600 dark:text-amber-400",
		chip: "border-amber-500/20 bg-amber-500/[0.08] text-amber-600 dark:text-amber-400",
	},
	D: {
		ring: "stroke-orange-500",
		text: "text-orange-600 dark:text-orange-400",
		chip: "border-orange-500/20 bg-orange-500/[0.08] text-orange-600 dark:text-orange-400",
	},
	F: {
		ring: "stroke-rose-500",
		text: "text-rose-600 dark:text-rose-400",
		chip: "border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:text-rose-400",
	},
};

const STATUS_DOT: Record<CheckStatus, string> = {
	pass: "bg-emerald-500",
	warn: "bg-amber-500",
	fail: "bg-rose-500",
	info: "bg-neutral-400",
};

const STATUS_BAR: Record<"pass" | "warn" | "fail", string> = {
	pass: "bg-emerald-500",
	warn: "bg-amber-500",
	fail: "bg-rose-500",
};

function getDomainParam(): string | null {
	if (typeof window === "undefined") return null;
	try {
		const param = new URLSearchParams(window.location.search).get("domain");
		return param?.trim() ? param.trim().slice(0, 253) : null;
	} catch {
		return null;
	}
}

function syncDomainParam(value: string | null) {
	try {
		const url = new URL(window.location.href);
		if (value) url.searchParams.set("domain", value);
		else url.searchParams.delete("domain");
		window.history.replaceState(null, "", url.toString());
	} catch {
		// Ignore history errors (e.g. non-HTTP contexts).
	}
}

function pageUrl() {
	return `${window.location.origin}${window.location.pathname}`;
}

function formatAge(days?: number) {
	if (days === undefined) return "Unknown";
	if (days >= 730) return `${Math.floor(days / 365)} years`;
	if (days >= 365) return "1 year";
	if (days >= 60) return `${Math.floor(days / 30)} months`;
	return `${days} days`;
}

function useCopy() {
	const [copied, setCopied] = useState<string | null>(null);
	const copy = async (key: string, text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(key);
			setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};
	return { copied, copy };
}

function CopyButton({
	label,
	copied,
	onClick,
	className,
}: {
	label: string;
	copied: boolean;
	onClick: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={copied ? "Copied" : label}
			className={cn(
				"inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white",
				className,
			)}
		>
			<Icon name={copied ? "check" : "copy"} className="size-3.5" />
			{copied ? "Copied" : label}
		</button>
	);
}

function ScoreRing({
	score,
	grade,
}: {
	score: number;
	grade: ReputationGrade;
}) {
	const radius = 42;
	const circumference = 2 * Math.PI * radius;
	return (
		<div className="relative size-28 shrink-0">
			<svg viewBox="0 0 100 100" className="-rotate-90 size-full" aria-hidden>
				<circle
					cx="50"
					cy="50"
					r={radius}
					fill="none"
					strokeWidth="7"
					className="stroke-stroke-soft-100 dark:stroke-white/10"
				/>
				<circle
					cx="50"
					cy="50"
					r={radius}
					fill="none"
					strokeWidth="7"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={circumference * (1 - score / 100)}
					className={cn(
						"transition-[stroke-dashoffset] duration-700",
						GRADE_TONE[grade].ring,
					)}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-semibold text-[2rem] text-text-strong-950 leading-none tracking-tight dark:text-white">
					{score}
				</span>
				<span className="mt-1 text-[11px] text-text-soft-400 dark:text-white/40">
					out of 100
				</span>
			</div>
		</div>
	);
}

function Pillars({ result }: { result: DomainReputationResponse }) {
	const { breakdown, details } = result;
	const blocklist = details.blocklist;
	const pillars = [
		{
			label: "Authentication",
			data: breakdown.authentication,
			value: `${breakdown.authentication.score}%`,
		},
		{
			label: "Blocklists",
			data: breakdown.blocklist,
			value:
				blocklist.listedCount > 0
					? `${blocklist.listedCount} listed`
					: `${blocklist.cleanCount}/${blocklist.totalChecked} clean`,
		},
		{
			label: "Domain age",
			data: breakdown.domainAge,
			value: formatAge(details.domainAge.ageDays),
		},
		{
			label: "DNS health",
			data: breakdown.dnsHealth,
			value: `${breakdown.dnsHealth.score}%`,
		},
	];

	return (
		<div className="grid grid-cols-2 border-stroke-soft-100 border-t lg:grid-cols-4 dark:border-white/10">
			{pillars.map((pillar, i) => (
				<div
					key={pillar.label}
					className={cn(
						"border-stroke-soft-100 p-4 sm:p-5 dark:border-white/10",
						i % 2 === 0 && "border-r",
						i < 2 && "border-b lg:border-b-0",
						i === 1 && "lg:border-r",
					)}
				>
					<div className="flex items-center justify-between gap-2">
						<span className="text-[12px] text-text-sub-600 dark:text-white/55">
							{pillar.label}
						</span>
						<span className="font-mono text-[11px] text-text-soft-400 dark:text-white/35">
							{pillar.data.weight}%
						</span>
					</div>
					<p className="mt-2 font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
						{pillar.value}
					</p>
					<div className="mt-3 h-1 overflow-hidden rounded-full bg-stroke-soft-100 dark:bg-white/10">
						<div
							className={cn(
								"h-full rounded-full",
								STATUS_BAR[pillar.data.status],
							)}
							style={{ width: `${Math.max(pillar.data.score, 4)}%` }}
						/>
					</div>
					<p className="mt-2.5 line-clamp-2 text-[12px] text-text-sub-600 leading-relaxed dark:text-white/50">
						{pillar.data.summary}
					</p>
				</div>
			))}
		</div>
	);
}

function FixCard({
	fix,
	copied,
	copy,
}: { fix: Fix } & ReturnType<typeof useCopy>) {
	return (
		<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 sm:p-5 dark:border-white/10 dark:bg-[#070707]">
			<div className="flex items-start gap-2.5">
				<span
					className={cn(
						"mt-1.5 size-2 shrink-0 rounded-full",
						STATUS_DOT[fix.severity],
					)}
				/>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
						{fix.title}
					</p>
					<p className="mt-1 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
						{fix.why}
					</p>
				</div>
			</div>

			{fix.records.map((record, i) => {
				const key = `${fix.id}-${i}`;
				return (
					<div
						key={key}
						className="mt-4 overflow-hidden rounded-lg border border-stroke-soft-100 bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.02]"
					>
						<div className="flex items-center justify-between gap-2 border-stroke-soft-100 border-b px-3 py-1.5 dark:border-white/10">
							<div className="flex min-w-0 items-center gap-3 font-mono text-[11.5px]">
								<span className="rounded bg-primary-base px-1.5 py-px font-semibold text-[10.5px] text-white dark:text-black">
									{record.type}
								</span>
								<span className="truncate text-text-sub-600 dark:text-white/55">
									Host{" "}
									<span className="text-text-strong-950 dark:text-white">
										{record.host}
									</span>
								</span>
							</div>
							<CopyButton
								label="Copy value"
								copied={copied === key}
								onClick={() => copy(key, record.value)}
								className="-mr-1.5"
							/>
						</div>
						<code className="block break-all px-3 py-2.5 font-mono text-[12px] text-text-strong-950 leading-relaxed dark:text-white/85">
							{record.value}
						</code>
					</div>
				);
			})}

			{fix.steps ? (
				<ul className="mt-3.5 space-y-1.5">
					{fix.steps.map((step) => (
						<li
							key={step}
							className="flex gap-2 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55"
						>
							<span
								aria-hidden
								className="mt-[7px] size-1 shrink-0 rounded-full bg-text-soft-400"
							/>
							{step}
						</li>
					))}
				</ul>
			) : null}

			{fix.link ? (
				<Link
					href={fix.link.href}
					className="mt-3.5 inline-flex items-center gap-1 font-medium text-[12.5px] text-text-strong-950 hover:underline dark:text-white"
				>
					{fix.link.label} →
				</Link>
			) : null}
		</div>
	);
}

function FixesTab({
	fixes,
	copyState,
}: {
	fixes: Fix[];
	copyState: ReturnType<typeof useCopy>;
}) {
	if (fixes.length === 0) {
		return (
			<EmptyState
				title="Nothing to fix"
				body="Authentication, blocklists, domain age, and DNS all look healthy. Keep complaint rates under 0.1% to stay there."
			/>
		);
	}
	return (
		<div className="space-y-3">
			{fixes.map((fix) => (
				<FixCard key={fix.id} fix={fix} {...copyState} />
			))}
		</div>
	);
}

function TierCell({ tier }: { tier: TierResult }) {
	if (tier.status === "none") {
		return (
			<span className="text-[12px] text-text-soft-400 dark:text-white/35">
				No DNS rule
			</span>
		);
	}
	const pass = tier.status === "pass";
	return (
		<span
			className={cn(
				"inline-flex items-start gap-1.5 font-medium text-[12.5px]",
				pass
					? "text-emerald-600 dark:text-emerald-400"
					: "text-rose-600 dark:text-rose-400",
			)}
		>
			<span
				className={cn(
					"mt-[6px] size-1.5 shrink-0 rounded-full",
					pass ? "bg-emerald-500" : "bg-rose-500",
				)}
			/>
			{pass ? "Meets rules" : `Missing ${tier.missing.join(", ")}`}
		</span>
	);
}

function ProvidersTab({ providers }: { providers: ProviderReadiness[] }) {
	const bulkReady = providers.filter((p) => p.bulk.status === "pass").length;
	const blocked = providers.filter((p) => p.all.status === "fail");
	const allReady = bulkReady === providers.length;

	return (
		<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-white/10 dark:bg-[#070707]">
			<div className="flex items-start gap-3 border-stroke-soft-100 border-b p-4 sm:p-5 dark:border-white/10">
				<Icon
					name={allReady ? "check-circle" : "alert-triangle"}
					className={cn(
						"mt-0.5 size-4.5 shrink-0",
						allReady
							? "text-emerald-500"
							: blocked.length > 0
								? "text-rose-500"
								: "text-amber-500",
					)}
				/>
				<div>
					<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
						{allReady
							? "Your DNS meets every major inbox provider's rules"
							: blocked.length > 0
								? `${new Intl.ListFormat("en", { type: "conjunction" }).format(blocked.map((p) => p.name))} may junk or reject your mail`
								: `Ready for bulk sending at ${bulkReady} of ${providers.length} providers`}
					</p>
					<p className="mt-1 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
						The authentication rules each provider publishes. Bulk rules apply
						once you send 5,000+ messages a day to that provider.
					</p>
				</div>
			</div>

			<table className="w-full text-left">
				<thead>
					<tr className="border-stroke-soft-100 border-b text-[11.5px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
						<th scope="col" className="px-4 py-2 font-medium sm:px-5">
							Provider
						</th>
						<th scope="col" className="px-2 py-2 font-medium sm:px-4">
							Every sender
						</th>
						<th scope="col" className="px-4 py-2 font-medium sm:px-5">
							Bulk senders
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-stroke-soft-100 dark:divide-white/5">
					{providers.map((provider) => (
						<tr key={provider.id}>
							<th
								scope="row"
								className="px-4 py-3 font-medium text-[13.5px] text-text-strong-950 sm:px-5 dark:text-white"
							>
								{provider.name}
							</th>
							<td className="px-2 py-3 sm:px-4">
								<TierCell tier={provider.all} />
							</td>
							<td className="px-4 py-3 sm:px-5">
								<TierCell tier={provider.bulk} />
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className="border-stroke-soft-100 border-t bg-bg-weak-50/60 px-4 py-4 sm:px-5 dark:border-white/10 dark:bg-white/[0.02]">
				<p className="font-medium text-[12.5px] text-text-strong-950 dark:text-white">
					Also checked in every message (not visible in DNS)
				</p>
				<ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
					{MESSAGE_LEVEL_RULES.map((rule) => (
						<li
							key={rule.label}
							className="text-[12px] text-text-sub-600 leading-relaxed dark:text-white/50"
						>
							<span className="text-text-strong-950 dark:text-white/80">
								{rule.label}.
							</span>{" "}
							{rule.detail}
						</li>
					))}
				</ul>
				<Link
					href="/tools/deliverability-tester"
					className="mt-3 inline-block font-medium text-[12.5px] text-text-strong-950 hover:underline dark:text-white"
				>
					Check alignment and reverse DNS with a real test email →
				</Link>
			</div>
		</div>
	);
}

function ChecksTab({ result }: { result: DomainReputationResponse }) {
	return (
		<div className="divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-white/5 dark:border-white/10 dark:bg-[#070707]">
			{result.checks.map((check) => (
				<div key={check.id} className="px-4 py-3 sm:px-5">
					<div className="flex items-center gap-2.5">
						<span
							className={cn(
								"size-2 shrink-0 rounded-full",
								STATUS_DOT[check.status],
							)}
						/>
						<span className="font-medium text-[13.5px] text-text-strong-950 dark:text-white">
							{check.label}
						</span>
					</div>
					<p className="mt-1 pl-[18px] text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
						{check.detail}
					</p>
					{check.record ? (
						<code className="mt-2 ml-[18px] block truncate rounded-md bg-bg-weak-50 px-2.5 py-1.5 font-mono text-[11.5px] text-text-sub-600 dark:bg-white/[0.04] dark:text-white/60">
							{check.record}
						</code>
					) : null}
				</div>
			))}
		</div>
	);
}

function BadgeTab({
	domain,
	copyState,
}: {
	domain: string;
	copyState: ReturnType<typeof useCopy>;
}) {
	// Embeds always point at production: every pasted badge is a backlink to reloop.sh.
	const base = `${productionSiteUrl}${toolPath}`;
	const badgeUrl = `${base}/badge/${domain}`;
	const reportUrl = `${base}?domain=${encodeURIComponent(domain)}`;
	const previewUrl = `${pageUrl()}/badge/${domain}`;
	const snippets = [
		{
			key: "html",
			label: "HTML",
			code: `<a href="${reportUrl}"><img src="${badgeUrl}" alt="Domain reputation for ${domain}" /></a>`,
		},
		{
			key: "markdown",
			label: "Markdown",
			code: `[![Domain reputation](${badgeUrl})](${reportUrl})`,
		},
	];

	return (
		<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 sm:p-5 dark:border-white/10 dark:bg-[#070707]">
			<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
				Show off your score
			</p>
			<p className="mt-1 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
				Add a live badge to your README, status page, or footer. It refreshes
				daily and links to this report.
			</p>
			<div className="mt-4 flex items-center rounded-lg border border-stroke-soft-100 border-dashed p-4 dark:border-white/10">
				<img
					src={previewUrl}
					alt={`Domain reputation badge for ${domain}`}
					height={20}
				/>
			</div>
			{snippets.map((snippet) => (
				<div
					key={snippet.key}
					className="mt-3 overflow-hidden rounded-lg border border-stroke-soft-100 bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.02]"
				>
					<div className="flex items-center justify-between border-stroke-soft-100 border-b px-3 py-1 dark:border-white/10">
						<span className="font-medium text-[12px] text-text-sub-600 dark:text-white/55">
							{snippet.label}
						</span>
						<CopyButton
							label="Copy"
							copied={copyState.copied === snippet.key}
							onClick={() => copyState.copy(snippet.key, snippet.code)}
							className="-mr-1.5"
						/>
					</div>
					<code className="block break-all px-3 py-2.5 font-mono text-[11.5px] text-text-strong-950 leading-relaxed dark:text-white/80">
						{snippet.code}
					</code>
				</div>
			))}
		</div>
	);
}

function EmptyState({ title, body }: { title: string; body: string }) {
	return (
		<div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4 sm:p-5">
			<Icon
				name="check-circle"
				className="mt-0.5 size-4.5 shrink-0 text-emerald-500"
			/>
			<div>
				<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
					{title}
				</p>
				<p className="mt-1 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
					{body}
				</p>
			</div>
		</div>
	);
}

type Tab = "fixes" | "providers" | "checks" | "badge";

type ReportTab = { id: Tab; label: string; icon: string; count?: number };

/** Same tab bar as the dashboard: underline on the active tab, a soft pill following the pointer. */
function ReportTabList({ tabs, active }: { tabs: ReportTab[]; active: Tab }) {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const activeIndex = tabs.findIndex((t) => t.id === active);
	const tabEl = buttonRefs.current[hoveredIdx ?? activeIndex];
	const rect = tabEl?.getBoundingClientRect();
	const parentRect = tabEl?.offsetParent?.getBoundingClientRect();
	const pill = rect
		? {
				pointerEvents: "none" as const,
				width: rect.width,
				height: rect.height - 14,
				left: rect.left - (parentRect?.left ?? 0),
				top: rect.top - (parentRect?.top ?? 0) + 7,
			}
		: null;

	return (
		<TabMenuHorizontal.List className="relative h-11 gap-0 border-b! py-0">
			{tabs.map((t, index) => (
				<TabMenuHorizontal.Trigger
					key={t.id}
					value={t.id}
					ref={(el) => {
						if (el) buttonRefs.current[index] = el;
					}}
					onPointerEnter={() => setHoveredIdx(index)}
					onPointerLeave={() => setHoveredIdx(undefined)}
					className="relative z-10 flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm"
				>
					<Icon name={t.icon} className="size-4" />
					{t.label}
					{t.count !== undefined ? (
						<span className="font-mono text-[11.5px] text-text-soft-400 dark:text-white/35">
							{t.count}
						</span>
					) : null}
				</TabMenuHorizontal.Trigger>
			))}
			<AnimatePresence>
				{pill ? (
					<motion.div
						className="absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
						initial={{ ...pill, opacity: 0 }}
						animate={{ ...pill, opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.14 }}
					/>
				) : null}
			</AnimatePresence>
		</TabMenuHorizontal.List>
	);
}

function ResultView({
	result,
	onReset,
}: {
	result: DomainReputationResponse;
	onReset: () => void;
}) {
	const fixes = buildFixes(result);
	const providers = buildProviderReadiness(result);
	const [tab, setTab] = useState<Tab>("fixes");
	const copyState = useCopy();
	const tone = GRADE_TONE[result.grade];

	const tabs: ReportTab[] = [
		{ id: "fixes", label: "Fixes", icon: "magic-wand", count: fixes.length },
		{ id: "providers", label: "Inbox providers", icon: "inbox" },
		{
			id: "checks",
			label: "All checks",
			icon: "logs",
			count: result.checks.length,
		},
		{ id: "badge", label: "Badge", icon: "shield-check" },
	];

	return (
		<div className="mt-6 space-y-3 text-left">
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0a0a0a]">
				<div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
					<ScoreRing score={result.score} grade={result.grade} />
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2.5">
							<h2 className="truncate font-semibold text-[1.4rem] text-text-strong-950 tracking-tight dark:text-white">
								{result.domain}
							</h2>
							<span
								className={cn(
									"rounded-md border px-2 py-0.5 font-mono font-semibold text-[12px]",
									tone.chip,
								)}
							>
								Grade {result.grade}
							</span>
						</div>
						<p className="mt-1.5 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
							{result.verdictLabel}
						</p>
						<p className="mt-2 text-[12px] text-text-soft-400 dark:text-white/35">
							{fixes.length === 0
								? "No issues found"
								: `${fixes.length} ${fixes.length === 1 ? "fix" : "fixes"} recommended`}{" "}
							· Checked in {(result.responseTimeMs / 1000).toFixed(1)}s
						</p>
					</div>
				</div>
				<Pillars result={result} />
			</div>

			<div className="-mx-2 flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-0.5 sm:gap-1.5">
					<button
						type="button"
						onClick={() =>
							copyState.copy(
								"link",
								`${pageUrl()}?domain=${encodeURIComponent(result.domain)}`,
							)
						}
						className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Icon
							name={copyState.copied === "link" ? "check" : "link"}
							className="size-3.5"
						/>
						{copyState.copied === "link" ? "Link copied" : "Share report"}
					</button>
					<CopyButton
						label="Copy JSON"
						copied={copyState.copied === "json"}
						onClick={() =>
							copyState.copy("json", JSON.stringify(result, null, 2))
						}
					/>
				</div>
				<button
					type="button"
					onClick={onReset}
					className="cursor-pointer rounded-lg px-2 py-1.5 font-medium text-primary-base text-xs hover:underline"
				>
					Check another domain
				</button>
			</div>

			<TabMenuHorizontal.Root
				value={tab}
				onValueChange={(value) => setTab(value as Tab)}
			>
				<ReportTabList tabs={tabs} active={tab} />
				<div className="pt-4">
					<TabMenuHorizontal.Content value="fixes">
						<FixesTab fixes={fixes} copyState={copyState} />
					</TabMenuHorizontal.Content>
					<TabMenuHorizontal.Content value="providers">
						<ProvidersTab providers={providers} />
					</TabMenuHorizontal.Content>
					<TabMenuHorizontal.Content value="checks">
						<ChecksTab result={result} />
					</TabMenuHorizontal.Content>
					<TabMenuHorizontal.Content value="badge">
						<BadgeTab domain={result.domain} copyState={copyState} />
					</TabMenuHorizontal.Content>
				</div>
			</TabMenuHorizontal.Root>
		</div>
	);
}

export function CheckerPanel() {
	const [value, setValue] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<DomainReputationResponse | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const run = async (raw: string) => {
		const domain = raw.trim();
		if (!domain) return;

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setIsPending(true);
		setError(null);

		try {
			const res = await runDomainReputationCheck(domain, controller.signal);
			setResult(res);
			syncDomainParam(res.domain);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				err instanceof ReputationRequestError
					? err.message
					: "Something went wrong running that check.",
			);
		} finally {
			if (!controller.signal.aborted) setIsPending(false);
		}
	};

	// Deep link: ?domain=stripe.com fills the input and runs on mount, so reports are shareable.
	// No run-once guard: the cleanup aborts the request, so a Strict Mode remount must re-run it.
	// biome-ignore lint/correctness/useExhaustiveDependencies: run on mount only
	useEffect(() => {
		const initial = getDomainParam();
		if (initial) {
			setValue(initial);
			void run(initial);
		}
		return () => abortRef.current?.abort();
	}, []);

	const handleReset = () => {
		abortRef.current?.abort();
		setResult(null);
		setError(null);
		setValue("");
		setIsPending(false);
		syncDomainParam(null);
		setTimeout(() => inputRef.current?.focus(), 50);
	};

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!isPending) void run(value);
	};

	return (
		<div className="mx-auto w-full text-left font-sans">
			<form onSubmit={onSubmit} noValidate className="mx-auto max-w-xl">
				<Input.Root
					size="medium"
					className="has-[input:focus]:!shadow-button-primary-focus has-[input:focus]:before:!ring-primary-base relative z-10 w-full rounded-xl bg-bg-white-0 shadow-xs transition-shadow sm:rounded-2xl dark:bg-[#0c0c0c]"
				>
					<Input.Wrapper className="h-12 pr-2 pl-4 dark:bg-[#0c0c0c]">
						<Input.Input
							ref={inputRef}
							id="reputation-input"
							aria-label="Domain"
							type="text"
							inputMode="url"
							autoComplete="off"
							autoCapitalize="none"
							spellCheck={false}
							value={value}
							onChange={(e) => {
								setValue(e.target.value);
								if (error) setError(null);
							}}
							placeholder="yourdomain.com"
							className="font-medium text-[15px]"
						/>
						<FancyButton.Root
							type="submit"
							variant="primary"
							size="xsmall"
							disabled={!isPending && !value.trim()}
							aria-busy={isPending}
							className="!p-0 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg dark:text-black"
							aria-label="Check domain reputation"
						>
							{isPending ? (
								<LoadingDot
									size={13}
									dotSize={2}
									className="text-white dark:text-black"
								/>
							) : (
								<FancyButton.Icon className="mx-0 size-3.5 dark:text-black">
									<Icon
										name="arrow-right"
										className="size-3.5 text-white dark:text-black"
									/>
								</FancyButton.Icon>
							)}
						</FancyButton.Root>
					</Input.Wrapper>
				</Input.Root>

				<div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[12px]">
					<span className="text-text-soft-400 dark:text-white/35">Try</span>
					{PRESETS.map((preset) => (
						<button
							key={preset}
							type="button"
							onClick={() => {
								setValue(preset);
								void run(preset);
							}}
							className="cursor-pointer rounded-md px-1.5 py-0.5 font-mono text-text-sub-600 underline decoration-dotted underline-offset-4 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
						>
							{preset}
						</button>
					))}
				</div>
			</form>

			{isPending && !result ? (
				<p className="mt-6 text-center text-[13px] text-text-sub-600 dark:text-white/55">
					Checking SPF, DKIM, DMARC, domain blocklists, domain age, and DNS…
				</p>
			) : null}

			{error ? (
				<div className="mx-auto mt-4 flex max-w-xl items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs">
					<Icon
						name="alert-triangle"
						className="mt-0.5 size-4 shrink-0 text-rose-500"
					/>
					<p className="text-rose-600 leading-relaxed dark:text-rose-400">
						{error}
					</p>
				</div>
			) : null}

			{result ? (
				<div className={cn("transition-opacity", isPending && "opacity-50")}>
					<ResultView
						key={result.domain + result.resolvedAt}
						result={result}
						onReset={handleReset}
					/>
				</div>
			) : null}
		</div>
	);
}
