"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon, type IconName } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { LoadingDot } from "@reloop/ui/loading-dot";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	type ClipboardEvent,
	type FormEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	type BimiCheckResponse,
	type CheckStatus,
	runBimiCheck,
} from "./check-api";
import {
	FIELD_ERROR_MESSAGE,
	normalizeDomainInput,
	validateCheckerInput,
} from "./syntax";

const HEIGHT_MORPH = {
	duration: 0.28,
	ease: [0.22, 1, 0.36, 1] as const,
};

const CROSSFADE = {
	duration: 0.22,
	ease: [0.22, 1, 0.36, 1] as const,
};

function getDomainParam(): string | null {
	if (typeof window === "undefined") return null;
	try {
		const param = new URLSearchParams(window.location.search).get("domain");
		return param && param.trim().length > 0 ? param.trim().slice(0, 253) : null;
	} catch {
		return null;
	}
}

function syncDomainParam(value: string | null) {
	if (typeof window === "undefined") return;
	try {
		const url = new URL(window.location.href);
		if (value && value.trim().length > 0) {
			url.searchParams.set("domain", value.trim());
		} else {
			url.searchParams.delete("domain");
		}
		window.history.replaceState(null, "", url.toString());
	} catch {
		// Ignore history errors (e.g. non-HTTP contexts).
	}
}

function buildShareUrl(input: string): string {
	const base =
		typeof window !== "undefined"
			? `${window.location.origin}${window.location.pathname}`
			: "/tools/bimi-checker";
	return `${base}?domain=${encodeURIComponent(input)}`;
}

function MorphSlot({
	activeKey,
	reduceMotion,
	children,
}: {
	activeKey: string | null;
	reduceMotion: boolean | null;
	children: ReactNode;
}) {
	const [height, setHeight] = useState<number | "auto">("auto");
	const [canAnimate, setCanAnimate] = useState(false);
	const innerRef = useRef<HTMLDivElement | null>(null);

	const setInnerRef = (node: HTMLDivElement | null) => {
		if (node) innerRef.current = node;
	};

	useEffect(() => {
		setCanAnimate(true);
	}, []);

	useEffect(() => {
		if (!activeKey) {
			setHeight(0);
			return;
		}

		const el = innerRef.current;
		if (!el) return;

		const update = () => {
			setHeight(Math.ceil(el.getBoundingClientRect().height));
		};

		update();
		if (typeof ResizeObserver === "undefined") return;
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, [activeKey]);

	return (
		<motion.div
			initial={false}
			animate={{ height: reduceMotion ? "auto" : height }}
			transition={reduceMotion || !canAnimate ? { duration: 0 } : HEIGHT_MORPH}
			className="relative overflow-hidden"
		>
			<AnimatePresence initial={false} mode="sync">
				{activeKey ? (
					<motion.div
						key={activeKey}
						initial={reduceMotion ? false : { opacity: 0, filter: "blur(2px)" }}
						animate={{
							opacity: 1,
							filter: "blur(0px)",
							pointerEvents: "auto",
						}}
						exit={
							reduceMotion
								? { opacity: 0, pointerEvents: "none" }
								: {
										opacity: 0,
										filter: "blur(2px)",
										pointerEvents: "none",
									}
						}
						transition={reduceMotion ? { duration: 0 } : CROSSFADE}
						className="absolute inset-x-0 top-0"
					>
						<div ref={setInnerRef}>{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.div>
	);
}

const VERDICT_STATUS_CONFIG: Record<
	CheckStatus,
	{
		label: string;
		hint: string;
		icon: IconName;
		iconClass: string;
	}
> = {
	pass: {
		label: "BIMI ready",
		hint: "Your logo can show next to your mail in inboxes that support BIMI.",
		icon: "check-circle",
		iconClass: "text-emerald-500",
	},
	warn: {
		label: "BIMI with warnings",
		hint: "Your logo may show in some inboxes. Fix the warnings below to show it everywhere.",
		icon: "alert-triangle",
		iconClass: "text-amber-500",
	},
	fail: {
		label: "BIMI not ready",
		hint: "Your logo won't show anywhere until the failing checks below are fixed.",
		icon: "cross-circle",
		iconClass: "text-rose-500 dark:text-rose-400",
	},
};

/** Solid scalloped badge with a cut-out check, like X's verified mark. */
function VerifiedBadge({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 22 22"
			aria-label="Verified"
			role="img"
			className={cn("text-emerald-500", className)}
		>
			<path
				fill="currentColor"
				d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
			/>
		</svg>
	);
}

const STATUS_LABEL: Record<CheckStatus, string> = {
	pass: "Pass",
	warn: "Warning",
	fail: "Fail",
};

const STATUS_STYLE: Record<
	CheckStatus,
	{ icon: IconName; iconClass: string; chip: string; tint: string }
> = {
	pass: {
		icon: "check-circle",
		iconClass: "text-emerald-500",
		chip: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
		tint: "border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/[0.08] dark:text-emerald-300",
	},
	warn: {
		icon: "alert-triangle",
		iconClass: "text-amber-500",
		chip: "border-amber-500/20 bg-amber-500/[0.08] text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
		tint: "border-amber-500/20 bg-amber-500/[0.05] text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/[0.08] dark:text-amber-300",
	},
	fail: {
		icon: "cross-circle",
		iconClass: "text-rose-500 dark:text-rose-400",
		chip: "border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400",
		tint: "border-rose-500/20 bg-rose-500/[0.05] text-rose-800 dark:border-rose-500/25 dark:bg-rose-500/[0.08] dark:text-rose-300",
	},
};

function isPreviewableLogoUrl(url: string | null): url is string {
	if (!url) return false;
	try {
		return new URL(url).protocol === "https:";
	} catch {
		return false;
	}
}

/** "resend.com" -> "Resend": a plausible sender name for the preview. */
function senderName(domain: string): string {
	const label = domain.replace(/^www\./, "").split(".")[0] ?? domain;
	return label.charAt(0).toUpperCase() + label.slice(1);
}

/** The brand logo, falling back to the sender's initial if it won't load. */
function BrandLogo({
	url,
	name,
	className,
	fallbackClassName,
}: {
	url: string | null;
	name: string;
	className?: string;
	fallbackClassName?: string;
}) {
	const [failed, setFailed] = useState(false);
	if (!isPreviewableLogoUrl(url) || failed) {
		return (
			<span
				className={cn(
					"flex items-center justify-center bg-bg-weak-50 font-semibold text-text-sub-600 dark:bg-white/[0.06] dark:text-white/60",
					className,
					fallbackClassName,
				)}
			>
				{name.charAt(0)}
			</span>
		);
	}
	return (
		<img
			src={url}
			alt={`${name} logo`}
			className={cn("bg-white object-cover", className)}
			referrerPolicy="no-referrer"
			onError={() => setFailed(true)}
		/>
	);
}

function SkeletonBar({ className }: { className?: string }) {
	return (
		<span
			aria-hidden
			className={cn(
				"block h-2 rounded-full bg-stroke-soft-100 dark:bg-white/10",
				className,
			)}
		/>
	);
}

const INBOX_FOLDERS = ["Inbox", "Starred", "Snoozed", "Sent", "Drafts"];

/**
 * A small mail client with the brand's emails in it, so the logo is seen
 * where it actually appears: the round avatar next to the sender.
 */
function InboxMock({
	logoUrl,
	domain,
	verified,
}: {
	logoUrl: string | null;
	domain: string;
	verified: boolean;
}) {
	const name = senderName(domain);
	const brandRows = [
		{
			subject: isPreviewableLogoUrl(logoUrl)
				? "Your emails now show our logo"
				: "Your account update",
			time: "1:12 PM",
		},
		{ subject: `What's new at ${name} this month`, time: "1:08 PM" },
	];
	return (
		<div
			aria-label={`Preview of ${name} emails in an inbox`}
			role="img"
			className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-white/10 dark:bg-[#0b0b0b]"
		>
			<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-3 py-2 dark:border-white/10">
				<span className="flex shrink-0 items-center gap-1">
					<span className="size-2 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
					<span className="size-2 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
					<span className="size-2 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
				</span>
				<span className="flex h-6 flex-1 items-center rounded-md bg-bg-weak-50 px-2.5 text-[11px] text-text-soft-400 dark:bg-white/[0.05] dark:text-white/35">
					Search mail
				</span>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-[112px_minmax(0,1fr)]">
				<div className="hidden flex-col gap-0.5 border-stroke-soft-100 border-r p-2 sm:flex dark:border-white/10">
					<span className="mb-2 flex h-7 items-center rounded-lg border border-stroke-soft-100 px-2.5 font-medium text-[11px] text-text-strong-950 dark:border-white/10 dark:text-white">
						Compose
					</span>
					{INBOX_FOLDERS.map((folder, i) => (
						<span
							key={folder}
							className={cn(
								"flex items-center justify-between rounded-md px-2 py-1 text-[11px]",
								i === 0
									? "bg-bg-weak-50 font-semibold text-text-strong-950 dark:bg-white/[0.06] dark:text-white"
									: "text-text-sub-600 dark:text-white/50",
							)}
						>
							{folder}
							{i === 0 ? <span className="text-[10px]">2</span> : null}
						</span>
					))}
				</div>
				<div className="min-w-0">
					<div className="flex border-stroke-soft-100 border-b px-2 text-[11px] dark:border-white/10">
						{["Primary", "Social", "Promotions"].map((tab, i) => (
							<span
								key={tab}
								className={cn(
									"px-2.5 py-2",
									i === 0
										? "border-text-strong-950 border-b-2 font-semibold text-text-strong-950 dark:border-white dark:text-white"
										: "text-text-soft-400 dark:text-white/40",
								)}
							>
								{tab}
							</span>
						))}
					</div>
					<ul className="divide-y divide-stroke-soft-100/70 dark:divide-white/5">
						{brandRows.map((row) => (
							<li
								key={row.subject}
								className="flex items-center gap-2.5 px-3 py-2.5"
							>
								<BrandLogo
									url={logoUrl}
									name={name}
									className="size-7 shrink-0 rounded-full border border-stroke-soft-100 dark:border-white/10"
									fallbackClassName="text-[11px]"
								/>
								<span className="flex w-24 shrink-0 items-center gap-1">
									<span className="truncate font-semibold text-[12px] text-text-strong-950 dark:text-white">
										{name}
									</span>
									{verified ? (
										<VerifiedBadge className="size-3 shrink-0" />
									) : null}
								</span>
								<span className="min-w-0 flex-1 truncate font-medium text-[12px] text-text-strong-950 dark:text-white/90">
									{row.subject}
								</span>
								<span className="shrink-0 font-semibold text-[10.5px] text-text-strong-950 dark:text-white/80">
									{row.time}
								</span>
							</li>
						))}
						{["w-16", "w-20", "w-14", "w-[4.5rem]"].map((width) => (
							<li key={width} className="flex items-center gap-2.5 px-3 py-3">
								<span className="size-7 shrink-0 rounded-full bg-bg-weak-50 dark:bg-white/[0.06]" />
								<span className="w-24 shrink-0">
									<SkeletonBar className={width} />
								</span>
								<SkeletonBar className="flex-1" />
								<SkeletonBar className="w-8 shrink-0" />
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

/** Parses "v=BIMI1; l=…; a=…" into a tag map. */
function parseBimiTags(record: string | null): Record<string, string> {
	const tags: Record<string, string> = {};
	if (!record) return tags;
	for (const part of record.split(";")) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		const key = part.slice(0, eq).trim().toLowerCase();
		if (key) tags[key] = part.slice(eq + 1).trim();
	}
	return tags;
}

const TAG_ROWS = [
	{
		tag: "v",
		name: "Version",
		meaning: "Marks this as a BIMI record. Must be BIMI1 and come first.",
	},
	{
		tag: "l",
		name: "Logo location",
		meaning:
			"HTTPS link to the square SVG logo inboxes show next to your mail.",
	},
	{
		tag: "a",
		name: "Certificate",
		meaning:
			"HTTPS link to a VMC or CMC certificate. Optional for most inboxes; Gmail and Apple Mail need it.",
	},
];

function ResultCardDetailed({
	result,
	onReset,
}: {
	result: BimiCheckResponse;
	onReset: () => void;
}) {
	const status = VERDICT_STATUS_CONFIG[result.verdict];
	const style = STATUS_STYLE[result.verdict];
	const tags = parseBimiTags(result.bimiRecord);
	// Most recommendations repeat a check's own "How to fix"; only list new ones.
	const shownFixes = new Set(
		result.checks.filter((c) => c.status !== "pass").map((c) => c.fix),
	);
	// A passing result's only "recommendation" restates the verdict.
	const extraRecommendations =
		result.verdict === "pass"
			? []
			: result.recommendations.filter((rec) => !shownFixes.has(rec));
	const name = senderName(result.domain);
	const [copiedLink, setCopiedLink] = useState(false);
	const [copiedJson, setCopiedJson] = useState(false);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(buildShareUrl(result.domain));
			setCopiedLink(true);
			setTimeout(() => setCopiedLink(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	const handleCopyJson = async () => {
		try {
			await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
			setCopiedJson(true);
			setTimeout(() => setCopiedJson(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	return (
		<div className="space-y-3 text-left text-xs">
			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-white/10 dark:bg-white/[0.02]">
				{/* Verdict */}
				<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 px-4 py-3">
					<div className="min-w-0">
						<div className="flex items-center gap-1.5">
							{result.verdict === "pass" ? (
								<VerifiedBadge className="size-[18px] shrink-0" />
							) : (
								<Icon
									name={status.icon}
									className={cn("size-4 shrink-0", status.iconClass)}
								/>
							)}
							<p className="font-semibold text-sm text-text-strong-950 dark:text-white">
								{status.label}
							</p>
						</div>
						<p className="mt-1 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
							{status.hint}
						</p>
					</div>
					<p className="truncate pt-0.5 font-mono text-[11px] text-text-soft-400 dark:text-white/40">
						{result.queryName}
					</p>
				</div>

				{/* Logo + where it shows */}
				<div className="grid gap-2 p-2 pt-0 sm:p-2.5 sm:pt-0 md:grid-cols-[280px_minmax(0,1fr)]">
					<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-5 dark:border-white/10 dark:bg-[#0b0b0b]">
						<BrandLogo
							url={result.logoUrl}
							name={name}
							className="size-44 rounded-3xl border border-stroke-soft-100 dark:border-white/10"
							fallbackClassName="text-4xl"
						/>
						<div className="flex items-center gap-2.5">
							<BrandLogo
								url={result.logoUrl}
								name={name}
								className="size-9 shrink-0 rounded-full border border-stroke-soft-100 dark:border-white/10"
								fallbackClassName="text-[13px]"
							/>
							<p className="text-[11.5px] text-text-sub-600 leading-snug dark:text-white/50">
								{isPreviewableLogoUrl(result.logoUrl)
									? "Inboxes crop it to a circle."
									: "No logo yet. Inboxes show your initial."}
							</p>
						</div>
					</div>
					<InboxMock
						logoUrl={result.logoUrl}
						domain={result.domain}
						verified={Boolean(result.authorityUrl)}
					/>
				</div>
			</div>

			{/* The record */}
			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-white/10">
				<div
					className={cn(
						"break-all border-b px-4 py-3 font-mono text-[12px]",
						result.bimiRecord ? style.tint : STATUS_STYLE.fail.tint,
					)}
				>
					{result.bimiRecord ?? `No BIMI record at ${result.queryName}`}
				</div>
				<table className="w-full text-left text-[12.5px]">
					<thead className="bg-bg-weak-50 text-[10.5px] text-text-sub-600 uppercase tracking-wider dark:bg-white/[0.03] dark:text-white/40">
						<tr>
							<th className="w-12 px-4 py-2 font-medium">Tag</th>
							<th className="px-2 py-2 font-medium">Value</th>
							<th className="hidden px-2 py-2 font-medium sm:table-cell">
								What it means
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-stroke-soft-100 bg-bg-white-0 dark:divide-white/5 dark:bg-transparent">
						{TAG_ROWS.map((row) => (
							<tr key={row.tag} className="align-top">
								<td className="px-4 py-2.5 font-mono font-semibold text-text-strong-950 dark:text-white">
									{row.tag}
								</td>
								<td className="px-2 py-2.5">
									<span className="font-medium text-text-strong-950 dark:text-white">
										{row.name}
									</span>
									<span className="mt-0.5 block break-all font-mono text-[11.5px] text-text-sub-600 dark:text-white/55">
										{tags[row.tag] || "(empty)"}
									</span>
									<span className="mt-1 block text-[12px] text-text-sub-600 leading-relaxed sm:hidden dark:text-white/50">
										{row.meaning}
									</span>
								</td>
								<td className="hidden px-2 py-2.5 pr-4 text-text-sub-600 leading-relaxed sm:table-cell dark:text-white/55">
									{row.meaning}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Tests */}
			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-white/10">
				<div className="flex items-baseline justify-between gap-3 border-stroke-soft-100 border-b bg-bg-weak-50 px-4 py-2 text-[10.5px] text-text-sub-600 uppercase tracking-wider dark:border-white/10 dark:bg-white/[0.03] dark:text-white/40">
					<span>Test</span>
					<span>Result</span>
				</div>
				<ul className="divide-y divide-stroke-soft-100 bg-bg-white-0 dark:divide-white/5 dark:bg-transparent">
					{result.checks.map((check) => {
						const s = STATUS_STYLE[check.status];
						return (
							<li key={check.id} className="flex items-start gap-3 px-4 py-2.5">
								<Icon
									name={s.icon}
									className={cn("mt-0.5 size-4 shrink-0", s.iconClass)}
								/>
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-3">
										<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
											{check.label}
										</span>
										<span
											className={cn(
												"shrink-0 rounded-md border px-1.5 py-px font-medium text-[11px]",
												s.chip,
											)}
										>
											{STATUS_LABEL[check.status]}
										</span>
									</div>
									<p className="mt-0.5 break-words text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
										{check.detail}
									</p>
									{check.record && check.id !== "bimi-present" ? (
										<code className="mt-1.5 block break-all rounded-md bg-bg-weak-50 px-2 py-1.5 font-mono text-[11px] text-text-strong-950 dark:bg-white/[0.04] dark:text-white/80">
											{check.record}
										</code>
									) : null}
									{check.fix && check.status !== "pass" ? (
										<p className="mt-1 text-[12.5px] text-text-strong-950 leading-relaxed dark:text-white/80">
											<span className="font-semibold">How to fix:</span>{" "}
											{check.fix}
										</p>
									) : null}
								</div>
							</li>
						);
					})}
				</ul>
			</div>

			{extraRecommendations.length > 0 && (
				<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-3 dark:border-white/10 dark:bg-transparent">
					<p className="font-semibold text-sm text-text-strong-950 dark:text-white">
						What to fix next
					</p>
					<ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
						{extraRecommendations.map((rec) => (
							<li key={rec}>{rec}</li>
						))}
					</ul>
				</div>
			)}

			{/* Actions Footer */}
			<div className="-mx-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={handleCopyLink}
						className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Icon name={copiedLink ? "check" : "link"} className="size-3.5" />
						{copiedLink ? "Link copied" : "Copy link"}
					</button>
					<button
						type="button"
						onClick={handleCopyJson}
						className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Icon name={copiedJson ? "check" : "copy"} className="size-3.5" />
						{copiedJson ? "Copied" : "Copy JSON"}
					</button>
				</div>
				<button
					type="button"
					onClick={onReset}
					className="cursor-pointer rounded-lg px-2 py-1.5 font-medium text-primary-base text-xs hover:underline"
				>
					Clear result
				</button>
			</div>
		</div>
	);
}

export function CheckerPanel() {
	const [value, setValue] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [result, setResult] = useState<BimiCheckResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const field = useFieldError();
	const shouldReduceMotion = useReducedMotion();
	const hasFieldError = field.hasError;
	const abortRef = useRef<AbortController | null>(null);

	const showFieldError = (message: string) => {
		setResult(null);
		setError(null);
		field.show(message);
	};

	const run = async (raw: string) => {
		const validity = validateCheckerInput(raw);
		if (!validity.ok) {
			showFieldError(FIELD_ERROR_MESSAGE);
			return;
		}

		field.clear();
		const domain = normalizeDomainInput(raw);

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setIsPending(true);
		setError(null);

		try {
			const response = await runBimiCheck(domain, controller.signal);
			if (controller.signal.aborted) return;
			setResult(response);
			syncDomainParam(response.domain);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong running that check.",
			);
		} finally {
			if (!controller.signal.aborted) setIsPending(false);
		}
	};

	const hasChecked = Boolean(result || error);

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (hasChecked) return;
		void run(value);
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		if (isPending) return;
		const pasted = e.clipboardData.getData("text").trim();
		if (!pasted) return;

		const validity = validateCheckerInput(pasted);
		if (validity.ok) {
			e.preventDefault();
			setValue(normalizeDomainInput(pasted));
			if (hasFieldError) field.clear();
			setResult(null);
			setError(null);
			void run(pasted);
		}
	};

	const handleReset = () => {
		abortRef.current?.abort();
		setResult(null);
		setError(null);
		field.clear();
		setValue("");
		syncDomainParam(null);
		setTimeout(() => field.inputRef.current?.focus(), 50);
	};

	useEffect(
		() => () => {
			abortRef.current?.abort();
		},
		[],
	);

	// Deep-link support: /tools/bimi-checker?domain=paypal.com
	// auto-fills and runs once so results are shareable. The timeout defers
	// past StrictMode's remount simulation (whose cleanup would otherwise
	// abort the only run); the cleanup clears the first timer so the check
	// still runs exactly once.
	// biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
	useEffect(() => {
		const initial = getDomainParam();
		if (!initial) return;
		setValue(normalizeDomainInput(initial));
		const t = setTimeout(() => {
			void run(initial);
		}, 0);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="w-full text-left font-sans">
			{/* Input Check Zone */}
			<form onSubmit={onSubmit} noValidate className="space-y-2.5">
				<div className="w-full max-w-xl">
					<FieldError field={field} messageClassName="text-xs leading-relaxed">
						<div className="relative w-full">
							<Input.Root
								size="medium"
								hasError={hasFieldError}
								className={cn(
									"relative z-10 w-full rounded-xl bg-bg-white-0 transition-shadow sm:rounded-2xl dark:bg-[#0c0c0c]",
									hasFieldError
										? "has-[input:focus]:!shadow-button-error-focus has-[input:focus]:before:!ring-error-base"
										: "has-[input:focus]:before:!ring-primary-base has-[input:focus]:!shadow-button-primary-focus",
								)}
							>
								<Input.Wrapper className="h-12 pr-2 pl-4 dark:bg-[#0c0c0c]">
									<Input.Input
										id="checker-input"
										aria-label="Domain"
										{...field.controlProps}
										type="text"
										inputMode="url"
										autoComplete="off"
										autoCapitalize="none"
										spellCheck={false}
										value={value}
										onPaste={handlePaste}
										onChange={(e) => {
											setValue(e.target.value);
											if (hasFieldError) field.clear();
											if (result) setResult(null);
											if (error) setError(null);
										}}
										placeholder="example.com"
										className="font-medium text-[15px]"
									/>
									{hasChecked ? (
										<button
											type="button"
											onClick={handleReset}
											className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
											aria-label="Clear check"
										>
											<svg
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2.5"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="size-3.5"
												aria-hidden="true"
											>
												<path d="M18 6L6 18M6 6l12 12" />
											</svg>
										</button>
									) : (
										<FancyButton.Root
											type="submit"
											variant="primary"
											size="xsmall"
											className="!p-0 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg dark:text-black"
											aria-label="Check BIMI record"
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
									)}
								</Input.Wrapper>
							</Input.Root>
						</div>
					</FieldError>
				</div>

				<MorphSlot
					activeKey={error ? "error" : result ? "result" : null}
					reduceMotion={shouldReduceMotion}
				>
					{error ? (
						<div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-text-sub-600 text-xs dark:text-white/60">
							<Icon
								name="alert-triangle"
								className="mt-0.5 size-4 shrink-0 text-rose-500"
							/>
							<p className="text-rose-600 leading-relaxed dark:text-rose-400">
								{error}
							</p>
						</div>
					) : result ? (
						<ResultCardDetailed result={result} onReset={handleReset} />
					) : null}
				</MorphSlot>
			</form>
		</div>
	);
}
