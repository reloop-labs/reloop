"use client";

import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as CompactButton from "@reloop/ui/compact-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { type SpoofCheckResult, runSpoofCheck } from "./check-api";

const PRESETS = [
	{ label: "stripe.com (Locked)", value: "stripe.com" },
	{ label: "github.com (Locked)", value: "github.com" },
	{ label: "reloop.sh", value: "reloop.sh" },
	{ label: "google.com", value: "google.com" },
	{ label: "apple.com", value: "apple.com" },
];

export function CheckerPanel() {
	const [domain, setDomain] = useState("stripe.com");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<SpoofCheckResult | null>(null);
	const [copied, setCopied] = useState(false);
	const [showRawRecords, setShowRawRecords] = useState(false);

	const abortRef = useRef<AbortController | null>(null);

	const executeCheck = async (targetDomain: string) => {
		const target = targetDomain.trim();
		if (!target) return;

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setIsLoading(true);
		setError(null);

		try {
			const res = await runSpoofCheck(target, controller.signal);
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				(err as Error).message ||
					"Failed to check domain spoofability. Please verify the domain name.",
			);
		} finally {
			if (!controller.signal.aborted) setIsLoading(false);
		}
	};

	useEffect(() => {
		return () => {
			abortRef.current?.abort();
		};
	}, []);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		executeCheck(domain);
	};

	const handleCopyReport = () => {
		if (!result) return;
		const report = `[Reloop Domain Spoofing Check]
Domain: ${result.domain}
Verdict: ${result.verdict.toUpperCase()}
Headline: ${result.headline}
Inbox Outcome: ${result.inboxOutcome.toUpperCase()}
Summary: ${result.summary}
DMARC Policy: ${result.dmarc.policy || "none"}
SPF: ${result.spf.rawRecord || "none"}
https://reloop.sh/tools/spoof-checker`;

		navigator.clipboard.writeText(report).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		<div className="mx-auto max-w-4xl">
			{/* Preset Bar */}
			<div className="mb-4 flex flex-wrap items-center gap-2">
				<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/35">
					Try Presets:
				</span>
				{PRESETS.map((preset) => (
					<button
						key={preset.label}
						type="button"
						onClick={() => {
							setDomain(preset.value);
							executeCheck(preset.value);
						}}
						className={cn(
							"rounded-lg px-2.5 py-1 font-mono text-[11.5px] transition-colors",
							domain === preset.value
								? "bg-text-strong-950 font-medium text-white shadow-xs dark:bg-white dark:text-black"
								: "border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-text-strong-950 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white dark:hover:text-white",
						)}
					>
						{preset.label}
					</button>
				))}
			</div>

			{/* Search Input Box */}
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#0b0b0b]">
				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
				>
					<Input.Root size="small" className="flex-1">
						<Input.Wrapper>
							<Input.Input
								value={domain}
								onChange={(e) => setDomain(e.target.value)}
								placeholder="Enter domain or URL (e.g. acme.com, https://acme.com)"
								disabled={isLoading}
							/>
						</Input.Wrapper>
					</Input.Root>

					<Button.Root
						type="submit"
						variant="primary"
						mode="filled"
						size="small"
						disabled={isLoading || !domain.trim()}
						className="shrink-0"
					>
						{isLoading ? (
							<>
								<Spinner size={14} />
								<span>Testing Spoofability...</span>
							</>
						) : (
							<>
								<Button.Icon as={Icon} name="search" className="size-3.5" />
								<span>Check My Domain</span>
							</>
						)}
					</Button.Root>
				</form>
				<p className="mt-2.5 font-mono text-[11px] text-text-sub-600 dark:text-white/40">
					We do not send test emails. We only query public DNS records across global root resolvers.
				</p>
			</div>

			{/* Error State */}
			{error && (
				<Alert.Root
					variant="lighter"
					status="error"
					size="large"
					className="mt-6"
				>
					<Alert.Icon as={Icon} name="alert-triangle" />
					<div>
						<div className="font-medium text-label-sm">Lookup error</div>
						<p className="mt-0.5 text-paragraph-sm">{error}</p>
					</div>
				</Alert.Root>
			)}

			{/* Results View */}
			{result && (
				<div className="mt-6 space-y-6">
					{/* Big Answer Verdict Card */}
					<div
						className={cn(
							"rounded-2xl border p-6 shadow-xs sm:p-7 transition-colors",
							result.verdict === "spoofable" &&
								"border-rose-500/30 bg-rose-500/[0.04] dark:border-rose-500/40 dark:bg-rose-500/[0.07]",
							result.verdict === "partially_protected" &&
								"border-amber-500/30 bg-amber-500/[0.04] dark:border-amber-500/40 dark:bg-amber-500/[0.07]",
							result.verdict === "protected" &&
								"border-emerald-500/30 bg-emerald-500/[0.04] dark:border-emerald-500/40 dark:bg-emerald-500/[0.07]",
						)}
					>
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
							<div>
								{/* Capsule Badge */}
								{result.verdict === "spoofable" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-3 py-1 font-medium text-[12.5px] text-error-base dark:bg-rose-500/15 dark:text-rose-400">
										<Icon name="minus-circle" className="size-4 shrink-0" />
										<span>Vulnerable to Spoofing</span>
									</div>
								)}
								{result.verdict === "partially_protected" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-3 py-1 font-medium text-[12.5px] text-warning-base dark:bg-amber-500/15 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-4 shrink-0" />
										<span>Partially Protected</span>
									</div>
								)}
								{result.verdict === "protected" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-3 py-1 font-medium text-[12.5px] text-success-base dark:bg-emerald-500/15 dark:text-emerald-400">
										<Icon name="shield-check" className="size-4 shrink-0" />
										<span>Protected — Receivers Reject Fakes</span>
									</div>
								)}

								<h2 className="mt-3 font-semibold text-[22px] text-text-strong-950 sm:text-[26px] tracking-tight dark:text-white">
									{result.headline}
								</h2>
								<p className="mt-2 max-w-2xl text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/70">
									{result.summary}
								</p>

								{result.subdomainNote && (
									<p className="mt-2 text-[13px] text-amber-600 dark:text-amber-400 font-medium">
										⚠️ {result.subdomainNote}
									</p>
								)}
							</div>

							<div className="flex shrink-0 items-center gap-2">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									onClick={handleCopyReport}
								>
									<Button.Icon
										as={Icon}
										name={copied ? "check" : "copy"}
										className={copied ? "text-emerald-500" : ""}
									/>
									<span>{copied ? "Copied" : "Copy summary"}</span>
								</Button.Root>
							</div>
						</div>
					</div>

					{/* 📧 Fake Inbox Mock (CEO Fraud Simulation) */}
					<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="mb-3 flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
							<span className="font-mono text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Simulated Inbox Outcome (Gmail / Outlook)
							</span>
							<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/45">
								CEO Fraud Simulation
							</span>
						</div>

						{/* Mock Inbox Row */}
						<div className="flex flex-col gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.02]">
							<div className="flex items-start gap-3.5">
								<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-[13px] text-white">
									CEO
								</div>
								<div className="min-w-0">
									<div className="flex flex-wrap items-baseline gap-2">
										<strong className="text-[13.5px] text-text-strong-950 dark:text-white">
											CEO
										</strong>
										<span className="font-mono text-[12px] text-text-sub-600 dark:text-white/50">
											&lt;ceo@{result.domain}&gt;
										</span>
									</div>
									<p className="mt-0.5 truncate font-medium text-[13px] text-text-strong-950 dark:text-white">
										Urgent: please wire $40,000 to vendor account today
									</p>
									<p className="truncate text-[12px] text-text-sub-600 dark:text-white/45">
										Hi team, please process this payment before end of day. Wire details attached...
									</p>
								</div>
							</div>

							{/* Inbox Status Outcome Badge */}
							<div className="shrink-0">
								{result.inboxOutcome === "delivered" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 font-medium text-[12px] text-rose-600 border border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400">
										<Icon name="alert-triangle" className="size-3.5 shrink-0" />
										<span>Would be delivered to Primary Inbox</span>
									</div>
								)}
								{result.inboxOutcome === "spam" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 font-medium text-[12px] text-amber-600 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-3.5 shrink-0" />
										<span>Would be routed to Spam / Junk folder</span>
									</div>
								)}
								{result.inboxOutcome === "rejected" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-[12px] text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400">
										<Icon name="shield-check" className="size-3.5 shrink-0" />
										<span>Would be blocked &amp; rejected at gateway</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* 🚦 Three Protocol Lights (SPF, DKIM, DMARC) */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						{/* DMARC Light */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
									DMARC (The Lock)
								</span>
								{result.dmarc.policy === "reject" ? (
									<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-emerald-600 dark:text-emerald-400">
										<Icon name="shield-check" className="size-3.5" /> p=reject
									</span>
								) : result.dmarc.policy === "quarantine" ? (
									<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-amber-600 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-3.5" /> p=quarantine
									</span>
								) : result.dmarc.policy === "none" ? (
									<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-rose-500">
										<Icon name="minus-circle" className="size-3.5" /> p=none (monitor)
									</span>
								) : (
									<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-rose-500">
										<Icon name="minus-circle" className="size-3.5" /> Missing
									</span>
								)}
							</div>
							<p className="mt-1.5 text-[12px] text-text-sub-600 dark:text-white/50">
								{result.dmarc.policy === "reject"
									? "Instructs receivers to discard unauthenticated mail."
									: result.dmarc.policy === "quarantine"
										? "Instructs receivers to route unauthenticated mail to spam."
										: "No instruction to block fakes. Open to spoofers."}
							</p>
						</div>

						{/* SPF Light */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
									SPF (Authorized IPs)
								</span>
								{result.spf.published && result.spf.qualifier !== "+all" ? (
									<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-emerald-600 dark:text-emerald-400">
										<Icon name="check" className="size-3.5" /> {result.spf.qualifier || "Valid"}
									</span>
								) : result.spf.qualifier === "+all" ? (
									<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-rose-500">
										<Icon name="minus-circle" className="size-3.5" /> +all (open)
									</span>
								) : (
									<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-amber-600 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-3.5" /> Missing
									</span>
								)}
							</div>
							<p className="mt-1.5 text-[12px] text-text-sub-600 dark:text-white/50">
								{result.spf.published
									? `${result.spf.lookupCount}/10 DNS lookups configured.`
									: "No list of authorized mail servers published."}
							</p>
						</div>

						{/* DKIM Light */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
									DKIM (Signatures)
								</span>
								{result.dkim.published ? (
									<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-emerald-600 dark:text-emerald-400">
										<Icon name="check" className="size-3.5" /> {result.dkim.selector}
									</span>
								) : (
									<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-text-sub-600 dark:text-white/45">
										<Icon name="info-outline" className="size-3.5" /> Custom
									</span>
								)}
							</div>
							<p className="mt-1.5 text-[12px] text-text-sub-600 dark:text-white/50">
								{result.dkim.published
									? `Found ${result.dkim.keyLength ? `${result.dkim.keyLength}-bit ` : ""}public key.`
									: "Tested common selectors (ESP may use custom key)."}
							</p>
						</div>
					</div>

					{/* 📋 Diagnostic Breakdown */}
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="border-b border-stroke-soft-200 px-4 py-3 sm:px-5 dark:border-white/10">
							<h3 className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
								Technical Verdict Breakdown ({result.reasons.length})
							</h3>
						</div>

						<div className="divide-y divide-stroke-soft-200 dark:divide-white/5">
							{result.reasons.map((r) => (
								<div
									key={r.id}
									className="flex items-start justify-between gap-4 px-4 py-3.5 sm:px-5"
								>
									<div className="flex items-start gap-3">
										<div className="mt-0.5">
											{r.severity === "critical" && (
												<Icon name="minus-circle" className="size-4 text-rose-500" />
											)}
											{r.severity === "warning" && (
												<Icon name="alert-triangle" className="size-4 text-amber-500" />
											)}
											{r.severity === "success" && (
												<Icon name="shield-check" className="size-4 text-emerald-500" />
											)}
											{r.severity === "info" && (
												<Icon name="info-outline" className="size-4 text-blue-500" />
											)}
										</div>
										<div>
											<p className="font-medium text-[13.5px] text-text-strong-950 dark:text-white">
												{r.title}
											</p>
											<p className="text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
												{r.detail}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* 🚀 Next Steps & Reloop CTA */}
					<div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5 sm:flex-row sm:items-center dark:border-blue-500/30 dark:bg-blue-500/[0.08]">
						<div className="space-y-1">
							<span className="font-mono text-[10.5px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">
								Recommended Action
							</span>
							<h3 className="font-semibold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
								{result.nextStep.title}
							</h3>
							<p className="max-w-xl text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
								{result.nextStep.body}
							</p>
						</div>

						<div className="flex flex-wrap items-center gap-2 shrink-0">
							<Button.Root asChild variant="primary" mode="filled" size="small">
								<a href={result.nextStep.href}>
									<span>Take Action</span>
									<Button.Icon as={Icon} name="arrow-right" />
								</a>
							</Button.Root>

							<Link href={`/tools/auth-checker?domain=${encodeURIComponent(result.domain)}`}>
								<Button.Root variant="neutral" mode="stroke" size="small">
									<Button.Icon as={Icon} name="lock" />
									<span>Full Protocol Audit</span>
								</Button.Root>
							</Link>
						</div>
					</div>

					{/* Collapsible Raw DNS Records */}
					<div className="pt-2">
						<button
							type="button"
							onClick={() => setShowRawRecords((prev) => !prev)}
							className="font-mono text-[12px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							{showRawRecords ? "▲ Hide raw DNS records" : "▼ View raw DNS records for proof"}
						</button>

						{showRawRecords && (
							<div className="mt-3 space-y-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 font-mono text-[11.5px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.02] dark:text-white">
								<div>
									<span className="text-text-sub-600 dark:text-white/40">DMARC (_dmarc.{result.domain}):</span>
									<p className="mt-0.5 break-all">{result.dmarc.rawRecord || "No record found"}</p>
								</div>
								<div className="pt-2 border-t border-stroke-soft-200 dark:border-white/10">
									<span className="text-text-sub-600 dark:text-white/40">SPF ({result.domain}):</span>
									<p className="mt-0.5 break-all">{result.spf.rawRecord || "No record found"}</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
