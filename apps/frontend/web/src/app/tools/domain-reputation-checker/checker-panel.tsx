"use client";

import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as CompactButton from "@reloop/ui/compact-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
	type CheckStatus,
	type DomainReputationResponse,
	ReputationRequestError,
	runDomainReputationCheck,
} from "./check-api";

const PRESETS = [
	{ label: "reloop.sh", value: "reloop.sh" },
	{ label: "stripe.com", value: "stripe.com" },
	{ label: "github.com", value: "github.com" },
	{ label: "google.com", value: "google.com" },
	{ label: "paypal.com", value: "paypal.com" },
];

function getGradeColor(grade: string) {
	switch (grade) {
		case "A+":
		case "A":
			return {
				badge:
					"bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
				gauge: "text-emerald-500 stroke-emerald-500",
				bgGlow: "from-emerald-500/10 via-transparent to-transparent",
			};
		case "B":
			return {
				badge:
					"bg-blue-500/15 text-blue-600 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
				gauge: "text-blue-500 stroke-blue-500",
				bgGlow: "from-blue-500/10 via-transparent to-transparent",
			};
		case "C":
			return {
				badge:
					"bg-amber-500/15 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
				gauge: "text-amber-500 stroke-amber-500",
				bgGlow: "from-amber-500/10 via-transparent to-transparent",
			};
		default:
			return {
				badge:
					"bg-rose-500/15 text-rose-600 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30",
				gauge: "text-rose-500 stroke-rose-500",
				bgGlow: "from-rose-500/10 via-transparent to-transparent",
			};
	}
}

function StatusBadge({ status }: { status: CheckStatus }) {
	switch (status) {
		case "pass":
			return (
				<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-medium font-mono text-[11px] text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
					<span className="size-1.5 rounded-full bg-emerald-500" />
					Pass
				</span>
			);
		case "warn":
			return (
				<span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-medium font-mono text-[11px] text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
					<span className="size-1.5 rounded-full bg-amber-500" />
					Warn
				</span>
			);
		case "fail":
			return (
				<span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-medium font-mono text-[11px] text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
					<span className="size-1.5 rounded-full bg-rose-500" />
					Fail
				</span>
			);
		default:
			return (
				<span className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-0.5 font-medium font-mono text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
					<span className="size-1.5 rounded-full bg-text-soft-400 dark:bg-white/40" />
					Info
				</span>
			);
	}
}

export function CheckerPanel() {
	const [domain, setDomain] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<DomainReputationResponse | null>(null);
	const [activeTab, setActiveTab] = useState<"all" | "issues" | "passed">(
		"all",
	);
	const [copied, setCopied] = useState(false);

	const abortRef = useRef<AbortController | null>(null);

	const executeCheck = async (targetDomain: string) => {
		const clean = targetDomain.trim();
		if (!clean) return;

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setIsLoading(true);
		setError(null);

		try {
			const res = await runDomainReputationCheck(clean, controller.signal);
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			if (err instanceof ReputationRequestError) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred while auditing reputation.");
			}
			setResult(null);
		} finally {
			if (!controller.signal.aborted) {
				setIsLoading(false);
			}
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

	const handleCopySummary = () => {
		if (!result) return;
		const summary = `[Reloop Domain Reputation Report]
Domain: ${result.domain}
Overall Score: ${result.score}/100 (Grade: ${result.grade})
Verdict: ${result.verdictLabel}
Authentication: ${result.breakdown.authentication.score}% (${result.breakdown.authentication.summary})
Blocklists: ${result.details.blocklist.cleanCount}/${result.details.blocklist.totalChecked} clean
Domain Age: ${result.details.domainAge.ageDays ?? "Unknown"} days (${result.details.domainAge.tier})
DNS Health: ${result.breakdown.dnsHealth.summary}
Audited At: ${result.resolvedAt}
Check here: https://reloop.sh/tools/domain-reputation-checker`;

		navigator.clipboard.writeText(summary).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const checks = result?.checks || [];
	const passCount = checks.filter((c) => c.status === "pass").length;
	const issuesCount = checks.filter(
		(c) => c.status === "warn" || c.status === "fail",
	).length;

	const filteredChecks = checks.filter((c) => {
		if (activeTab === "passed") return c.status === "pass";
		if (activeTab === "issues")
			return c.status === "warn" || c.status === "fail";
		return true;
	});

	const gradeColor = result ? getGradeColor(result.grade) : null;

	return (
		<div className="mx-auto max-w-5xl">
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

			{/* Search Input Card */}
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
				<form onSubmit={handleSubmit} className="p-2 sm:p-3">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<Input.Root size="small" className="flex-1">
							<Input.Wrapper>
								<Input.Input
									type="text"
									value={domain}
									onChange={(e) => setDomain(e.target.value)}
									placeholder="Enter root domain (e.g. acme.com or reloop.sh)..."
									disabled={isLoading}
									autoComplete="off"
									spellCheck={false}
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
									<span>Auditing...</span>
								</>
							) : (
								<>
									<Button.Icon
										as={Icon}
										name="shield-check"
										className="size-3.5"
									/>
									<span>Audit Reputation</span>
								</>
							)}
						</Button.Root>
					</div>
				</form>
			</div>

			{/* Error Alert */}
			{error && (
				<Alert.Root
					variant="lighter"
					status="error"
					size="large"
					className="mt-6"
				>
					<Alert.Icon as={Icon} name="alert-triangle" />
					<div>
						<div className="font-medium text-label-sm">
							Reputation Check Failed
						</div>
						<p className="mt-0.5 text-paragraph-sm">{error}</p>
					</div>
				</Alert.Root>
			)}

			{/* Loading Skeleton */}
			{isLoading && (
				<div className="mt-8 animate-pulse space-y-6">
					<div className="h-44 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]" />
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div className="h-32 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]" />
						<div className="h-32 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]" />
						<div className="h-32 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]" />
						<div className="h-32 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]" />
					</div>
				</div>
			)}

			{/* Results View */}
			{result && !isLoading && (
				<div className="mt-8 space-y-8">
					{/* Overall Score Banner */}
					<div
						className={cn(
							"relative overflow-hidden rounded-2xl border border-stroke-soft-200 bg-gradient-to-b p-6 sm:p-8 dark:border-white/10 dark:bg-white/[0.02]",
							gradeColor?.bgGlow,
						)}
					>
						<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
							<div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
								{/* Score Gauge Circle */}
								<div className="relative flex size-28 shrink-0 items-center justify-center rounded-full border-4 border-stroke-soft-200 bg-bg-white-0 shadow-inner sm:size-32 dark:border-white/10 dark:bg-black">
									<div className="flex flex-col items-center">
										<span className="font-bold text-3xl text-text-strong-950 tracking-tight sm:text-4xl dark:text-white">
											{result.score}
										</span>
										<span className="font-mono text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
											out of 100
										</span>
									</div>
								</div>

								{/* Verdict Info */}
								<div className="space-y-2">
									<div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
										<span className="font-semibold text-2xl text-text-strong-950 sm:text-3xl dark:text-white">
											{result.domain}
										</span>
										<span
											className={cn(
												"inline-flex items-center rounded-lg border px-3 py-1 font-bold font-mono text-sm tracking-wide",
												gradeColor?.badge,
											)}
										>
											Grade: {result.grade}
										</span>
									</div>

									<p className="font-medium text-[15px] text-text-sub-600 dark:text-white/70">
										{result.verdictLabel}
									</p>

									<div className="flex flex-wrap items-center justify-center gap-3 pt-1 font-mono text-[11.5px] text-text-soft-400 sm:justify-start dark:text-white/40">
										<span>Latency: {result.responseTimeMs}ms</span>
										<span>•</span>
										<span>
											Audited:{" "}
											{new Date(result.resolvedAt).toLocaleTimeString()}
										</span>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex shrink-0 items-center gap-2">
								<CompactButton.Root
									variant="stroke"
									onClick={handleCopySummary}
									className="gap-1.5"
								>
									<Icon
										name={copied ? "check" : "copy-01"}
										className="size-4 text-text-sub-600 dark:text-white/70"
									/>
									<span>{copied ? "Copied Report" : "Copy Report"}</span>
								</CompactButton.Root>
							</div>
						</div>
					</div>

					{/* 4 Pillars Grid */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{/* 1. Authentication */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-white/[0.02]">
							<div className="flex items-center justify-between">
								<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
									Authentication (35%)
								</span>
								<StatusBadge status={result.breakdown.authentication.status} />
							</div>
							<div className="mt-3 flex items-baseline gap-2">
								<span className="font-bold text-2xl text-text-strong-950 dark:text-white">
									{result.breakdown.authentication.score}%
								</span>
							</div>
							<p className="mt-2 line-clamp-2 text-[12.5px] text-text-sub-600 dark:text-white/50">
								{result.breakdown.authentication.summary}
							</p>
						</div>

						{/* 2. Blocklists */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-white/[0.02]">
							<div className="flex items-center justify-between">
								<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
									Blocklists (30%)
								</span>
								<StatusBadge status={result.breakdown.blocklist.status} />
							</div>
							<div className="mt-3 flex items-baseline gap-2">
								<span className="font-bold text-2xl text-text-strong-950 dark:text-white">
									{result.details.blocklist.cleanCount}/
									{result.details.blocklist.totalChecked}
								</span>
								<span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
									Clean
								</span>
							</div>
							<p className="mt-2 line-clamp-2 text-[12.5px] text-text-sub-600 dark:text-white/50">
								{result.details.blocklist.listedCount === 0
									? "Clean on all monitored domain DNSBLs."
									: `Flagged on ${result.details.blocklist.listedCount} blocklists.`}
							</p>
						</div>

						{/* 3. Domain Age */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-white/[0.02]">
							<div className="flex items-center justify-between">
								<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
									Domain Age (20%)
								</span>
								<StatusBadge status={result.breakdown.domainAge.status} />
							</div>
							<div className="mt-3 flex items-baseline gap-2">
								<span className="font-bold text-2xl text-text-strong-950 dark:text-white">
									{result.details.domainAge.ageDays !== undefined
										? `${result.details.domainAge.ageDays}d`
										: "N/A"}
								</span>
								<span className="font-mono text-[11px] text-text-sub-600 capitalize dark:text-white/50">
									({result.details.domainAge.tier})
								</span>
							</div>
							<p className="mt-2 line-clamp-2 text-[12.5px] text-text-sub-600 dark:text-white/50">
								{result.details.domainAge.registrar
									? `Registrar: ${result.details.domainAge.registrar}`
									: result.details.domainAge.detail}
							</p>
						</div>

						{/* 4. DNS Infrastructure */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-white/[0.02]">
							<div className="flex items-center justify-between">
								<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
									DNS Health (15%)
								</span>
								<StatusBadge status={result.breakdown.dnsHealth.status} />
							</div>
							<div className="mt-3 flex items-baseline gap-2">
								<span className="font-bold text-2xl text-text-strong-950 dark:text-white">
									{result.breakdown.dnsHealth.score}%
								</span>
							</div>
							<p className="mt-2 line-clamp-2 text-[12.5px] text-text-sub-600 dark:text-white/50">
								{result.breakdown.dnsHealth.summary}
							</p>
						</div>
					</div>

					{/* Actionable Recommendations */}
					{result.recommendations.length > 0 && (
						<div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 dark:border-amber-500/20 dark:bg-amber-500/[0.03]">
							<div className="flex items-center gap-2.5">
								<Icon
									name="alert-circle"
									className="size-5 text-amber-600 dark:text-amber-400"
								/>
								<h3 className="font-semibold text-base text-text-strong-950 dark:text-white">
									Prioritized Deliverability Recommendations
								</h3>
							</div>
							<ul className="mt-4 space-y-2.5">
								{result.recommendations.map((rec) => (
									<li
										key={rec}
										className="flex items-start gap-2.5 text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/70"
									>
										<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
										<span>{rec}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Detailed Checks Breakdown */}
					<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h3 className="font-semibold text-lg text-text-strong-950 dark:text-white">
									Individual Audit Checks
								</h3>
								<p className="text-[13px] text-text-sub-600 dark:text-white/50">
									Detailed evaluation of sender authentication, DNS zones, and
									domain telemetry.
								</p>
							</div>

							{/* Filter Tabs */}
							<div className="flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-1 dark:border-white/10 dark:bg-white/5">
								<button
									type="button"
									onClick={() => setActiveTab("all")}
									className={cn(
										"rounded-md px-3 py-1 font-mono text-[11.5px] transition-colors",
										activeTab === "all"
											? "bg-bg-white-0 font-medium text-text-strong-950 shadow-xs dark:bg-white/10 dark:text-white"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
									)}
								>
									All ({checks.length})
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("issues")}
									className={cn(
										"rounded-md px-3 py-1 font-mono text-[11.5px] transition-colors",
										activeTab === "issues"
											? "bg-bg-white-0 font-medium text-text-strong-950 shadow-xs dark:bg-white/10 dark:text-white"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
									)}
								>
									Issues ({issuesCount})
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("passed")}
									className={cn(
										"rounded-md px-3 py-1 font-mono text-[11.5px] transition-colors",
										activeTab === "passed"
											? "bg-bg-white-0 font-medium text-text-strong-950 shadow-xs dark:bg-white/10 dark:text-white"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
									)}
								>
									Passed ({passCount})
								</button>
							</div>
						</div>

						{/* Checks List */}
						<div className="mt-6 divide-y divide-stroke-soft-200 border-stroke-soft-200 border-t dark:divide-white/10 dark:border-white/10">
							{filteredChecks.map((check) => (
								<div key={check.id} className="space-y-2 py-4">
									<div className="flex items-center justify-between gap-4">
										<div className="flex items-center gap-2.5">
											<span className="font-medium text-[14px] text-text-strong-950 dark:text-white">
												{check.label}
											</span>
											<span className="font-mono text-[10.5px] text-text-soft-400 uppercase dark:text-white/40">
												[{check.category.replace("_", " ")}]
											</span>
										</div>
										<StatusBadge status={check.status} />
									</div>

									<p className="text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
										{check.detail}
									</p>

									{check.record && (
										<div className="mt-1">
											<pre className="overflow-x-auto rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-2 font-mono text-[11px] text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
												{check.record}
											</pre>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
