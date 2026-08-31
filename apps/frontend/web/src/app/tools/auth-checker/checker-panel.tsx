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
import { type DomainAuthReport, runAuthCheck } from "./check-api";

const PRESETS = [
	{ label: "stripe.com", value: "stripe.com" },
	{ label: "google.com", value: "google.com" },
	{ label: "apple.com", value: "apple.com" },
	{ label: "github.com", value: "github.com" },
	{ label: "amazon.com", value: "amazon.com" },
];

export function CheckerPanel() {
	const [domain, setDomain] = useState("stripe.com");
	const [selector, setSelector] = useState("");
	const [showSelectorInput, setShowSelectorInput] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<DomainAuthReport | null>(null);
	const [copied, setCopied] = useState(false);
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const abortRef = useRef<AbortController | null>(null);

	const executeCheck = async (targetDomain: string, targetSelector?: string) => {
		const target = targetDomain.trim();
		if (!target) return;

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setIsLoading(true);
		setError(null);

		try {
			const res = await runAuthCheck(
				target,
				targetSelector || selector,
				controller.signal,
			);
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				(err as Error).message ||
					"Failed to query email authentication records. Please verify the domain name.",
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
		executeCheck(domain, selector);
	};

	const handleCopyReport = () => {
		if (!result) return;
		const report = `[Reloop Email Authentication Audit]
Domain: ${result.domain}
Score: ${result.score}/100 (Grade: ${result.grade})
Verdict: ${result.verdictLabel}
DMARC Policy: ${result.dmarc.policy || "none"} (RUA: ${result.dmarc.rua[0] || "none"})
SPF: ${result.spf.rawRecord || "none"} (Lookups: ${result.spf.lookupCount}/10)
DKIM (${result.dkim.selector || "unknown"}): ${result.dkim.keyLength ? `${result.dkim.keyLength}-bit` : "not detected"}
MX Provider: ${result.mx.provider || "standard MX"}
Latency: ${result.responseTimeMs}ms
https://reloop.sh/tools/auth-checker`;

		navigator.clipboard.writeText(report).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const handleCopyValue = (text: string, key: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedKey(key);
			setTimeout(() => setCopiedKey(null), 2000);
		});
	};

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
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#0b0b0b]">
				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
						<Input.Root size="small" className="flex-1">
							<Input.Wrapper>
								<Input.Input
									value={domain}
									onChange={(e) => setDomain(e.target.value)}
									placeholder="Enter sending domain (e.g. stripe.com, google.com)"
									disabled={isLoading}
								/>
							</Input.Wrapper>
						</Input.Root>

						{showSelectorInput && (
							<Input.Root size="small" className="w-full sm:w-44">
								<Input.Wrapper>
									<Input.Input
										value={selector}
										onChange={(e) => setSelector(e.target.value)}
										placeholder="DKIM selector"
										disabled={isLoading}
									/>
								</Input.Wrapper>
							</Input.Root>
						)}

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
									<span>Auditing Records...</span>
								</>
							) : (
								<>
									<Button.Icon as={Icon} name="search" className="size-3.5" />
									<span>Check Authentication</span>
								</>
							)}
						</Button.Root>
					</div>

					<div className="flex items-center justify-between text-[12px] text-text-sub-600 dark:text-white/45">
						<button
							type="button"
							onClick={() => setShowSelectorInput((prev) => !prev)}
							className="font-mono text-[11px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							{showSelectorInput
								? "— Hide DKIM selector"
								: "+ Specify custom DKIM selector"}
						</button>

						<span className="font-mono text-[11px]">
							RFC 7208 (SPF) · RFC 6376 (DKIM) · RFC 7489 (DMARC)
						</span>
					</div>
				</form>
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
					{/* Lead Gen Banner */}
					<div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5 sm:flex-row sm:items-center dark:border-blue-500/30 dark:bg-blue-500/[0.08]">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-medium text-[12px] text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
									<Icon name="shield-check" className="size-3.5 shrink-0" />
									<span>Automated Alignment</span>
								</div>
								<span className="text-[12px] text-text-sub-600 dark:text-white/50">
									Reach 100% inbox placement
								</span>
							</div>
							<h3 className="font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
								Automate SPF, DKIM &amp; DMARC with Reloop
							</h3>
							<p className="max-w-xl text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
								1-click DNS record verification, automated key rotation, and real-time alerts when your domain records drift.
							</p>
						</div>

						<Button.Root asChild variant="primary" mode="filled" size="small" className="shrink-0">
							<a href="/dashboard/signup">
								<span>Start Free Trial</span>
								<Button.Icon as={Icon} name="arrow-right" />
							</a>
						</Button.Root>
					</div>

					{/* Summary Header Card */}
					<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="flex flex-col justify-between gap-4 border-b border-stroke-soft-200 pb-5 sm:flex-row sm:items-center dark:border-white/10">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
									<Icon name="lock" className="size-5" />
								</div>
								<div>
									<div className="flex flex-wrap items-center gap-2.5">
										<h2 className="font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
											{result.domain}
										</h2>

										{/* Capsule Verdict matching Spam Score Checker */}
										{result.verdict === "fully_aligned" && (
											<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-2.5 py-0.5 font-medium text-[12px] text-success-base dark:bg-emerald-500/10 dark:text-emerald-400">
												<Icon name="shield-check" className="size-3.5 shrink-0" />
												<span>{result.verdictLabel}</span>
											</div>
										)}
										{result.verdict === "partially_aligned" && (
											<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-2.5 py-0.5 font-medium text-[12px] text-warning-base dark:bg-amber-500/10 dark:text-amber-400">
												<Icon name="alert-triangle" className="size-3.5 shrink-0" />
												<span>{result.verdictLabel}</span>
											</div>
										)}
										{(result.verdict === "misconfigured" ||
											result.verdict === "vulnerable") && (
											<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-2.5 py-0.5 font-medium text-[12px] text-error-base dark:bg-rose-500/10 dark:text-rose-400">
												<Icon name="minus-circle" className="size-3.5 shrink-0" />
												<span>{result.verdictLabel}</span>
											</div>
										)}
									</div>
									<p className="mt-0.5 font-mono text-[12px] text-text-sub-600 dark:text-white/45">
										MX Host:{" "}
										<span className="text-text-strong-950 dark:text-white">
											{result.mx.provider || (result.mx.records[0]?.exchange ?? "None")}
										</span>
										{" "}· Latency:{" "}
										<span className="text-emerald-600 dark:text-emerald-400">
											{result.responseTimeMs} ms
										</span>
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
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

								<Link href={`/tools/dns-lookup?domain=${encodeURIComponent(result.domain)}`}>
									<Button.Root variant="neutral" mode="stroke" size="small">
										<Button.Icon as={Icon} name="globe" />
										<span>All DNS Records</span>
									</Button.Root>
								</Link>
							</div>
						</div>

						{/* Score & Core Protocol Badges */}
						<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
								<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
									Auth Score &amp; Grade
								</span>
								<div className="mt-1 flex items-baseline gap-2">
									<span className="font-bold text-[22px] text-text-strong-950 dark:text-white">
										{result.score}/100
									</span>
									<span className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono font-semibold text-[11px] text-text-strong-950 dark:bg-white/10 dark:text-white">
										Grade {result.grade}
									</span>
								</div>
							</div>

							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
								<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
									DMARC Policy
								</span>
								<p className="mt-1 font-mono font-semibold text-[15px] text-text-strong-950 dark:text-white">
									{result.dmarc.policy ? `p=${result.dmarc.policy}` : "Missing"}
								</p>
							</div>

							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
								<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
									SPF Lookups
								</span>
								<p className="mt-1 font-mono font-semibold text-[15px] text-text-strong-950 dark:text-white">
									{result.spf.published ? `${result.spf.lookupCount}/10 Lookups` : "Missing"}
								</p>
							</div>

							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
								<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
									DKIM Public Key
								</span>
								<p className="mt-1 font-mono font-semibold text-[15px] text-text-strong-950 dark:text-white">
									{result.dkim.published
										? `${result.dkim.keyLength ? `${result.dkim.keyLength}-bit` : "Published"}`
										: "Not Detected"}
								</p>
							</div>
						</div>
					</div>

					{/* Protocol Cards Grid */}
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						{/* 1. DMARC Card */}
						<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
								<div className="flex items-center gap-2">
									<Icon name="shield-check" className="size-4 text-text-strong-950 dark:text-white" />
									<h3 className="font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
										DMARC Policy (RFC 7489)
									</h3>
								</div>
								{result.dmarc.status === "pass" ? (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-2.5 py-0.5 font-medium text-[12px] text-success-base dark:bg-emerald-500/10 dark:text-emerald-400">
										<Icon name="check-circle" className="size-3.5 shrink-0" />
										<span>Pass</span>
									</div>
								) : result.dmarc.status === "warn" ? (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-2.5 py-0.5 font-medium text-[12px] text-warning-base dark:bg-amber-500/10 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-3.5 shrink-0" />
										<span>Monitoring Only</span>
									</div>
								) : (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-2.5 py-0.5 font-medium text-[12px] text-error-base dark:bg-rose-500/10 dark:text-rose-400">
										<Icon name="minus-circle" className="size-3.5 shrink-0" />
										<span>Missing</span>
									</div>
								)}
							</div>

							<div className="mt-3.5 space-y-3 text-[13px]">
								{result.dmarc.rawRecord ? (
									<div className="relative rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 font-mono text-[12px] text-text-strong-950 break-all dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
										{result.dmarc.rawRecord}
										<div className="mt-2 flex justify-end">
											<CompactButton.Root
												type="button"
												variant="ghost"
												size="medium"
												onClick={() => handleCopyValue(result.dmarc.rawRecord || "", "dmarc")}
											>
												<CompactButton.Icon
													as={Icon}
													name={copiedKey === "dmarc" ? "check" : "copy"}
													className={copiedKey === "dmarc" ? "text-emerald-500" : ""}
												/>
											</CompactButton.Root>
										</div>
									</div>
								) : (
									<p className="text-text-sub-600 dark:text-white/50">
										No TXT record found at <code className="font-mono text-[11.5px]">_dmarc.{result.domain}</code>
									</p>
								)}

								<div className="grid grid-cols-2 gap-2 text-[12px]">
									<div>
										<span className="text-text-sub-600 dark:text-white/45">Policy (p):</span>{" "}
										<strong className="font-mono text-text-strong-950 dark:text-white">
											{result.dmarc.policy || "none"}
										</strong>
									</div>
									<div>
										<span className="text-text-sub-600 dark:text-white/45">Percentage (pct):</span>{" "}
										<strong className="font-mono text-text-strong-950 dark:text-white">
											{result.dmarc.percentage ?? 100}%
										</strong>
									</div>
									<div className="col-span-2 truncate">
										<span className="text-text-sub-600 dark:text-white/45">Reports (rua):</span>{" "}
										<span className="font-mono text-text-strong-950 dark:text-white">
											{result.dmarc.rua[0] || "None configured"}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* 2. SPF Card */}
						<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
								<div className="flex items-center gap-2">
									<Icon name="mail" className="size-4 text-text-strong-950 dark:text-white" />
									<h3 className="font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
										SPF Authentication (RFC 7208)
									</h3>
								</div>
								{result.spf.status === "pass" ? (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-2.5 py-0.5 font-medium text-[12px] text-success-base dark:bg-emerald-500/10 dark:text-emerald-400">
										<Icon name="check-circle" className="size-3.5 shrink-0" />
										<span>Pass</span>
									</div>
								) : result.spf.status === "warn" ? (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-2.5 py-0.5 font-medium text-[12px] text-warning-base dark:bg-amber-500/10 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-3.5 shrink-0" />
										<span>Warning</span>
									</div>
								) : (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-2.5 py-0.5 font-medium text-[12px] text-error-base dark:bg-rose-500/10 dark:text-rose-400">
										<Icon name="minus-circle" className="size-3.5 shrink-0" />
										<span>Missing</span>
									</div>
								)}
							</div>

							<div className="mt-3.5 space-y-3 text-[13px]">
								{result.spf.rawRecord ? (
									<div className="relative rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 font-mono text-[12px] text-text-strong-950 break-all dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
										{result.spf.rawRecord}
										<div className="mt-2 flex justify-end">
											<CompactButton.Root
												type="button"
												variant="ghost"
												size="medium"
												onClick={() => handleCopyValue(result.spf.rawRecord || "", "spf")}
											>
												<CompactButton.Icon
													as={Icon}
													name={copiedKey === "spf" ? "check" : "copy"}
													className={copiedKey === "spf" ? "text-emerald-500" : ""}
												/>
											</CompactButton.Root>
										</div>
									</div>
								) : (
									<p className="text-text-sub-600 dark:text-white/50">
										No SPF TXT record published on root domain
									</p>
								)}

								<div className="grid grid-cols-2 gap-2 text-[12px]">
									<div>
										<span className="text-text-sub-600 dark:text-white/45">Lookup Count:</span>{" "}
										<strong
											className={cn(
												"font-mono",
												result.spf.lookupCount > 10
													? "text-rose-500"
													: "text-text-strong-950 dark:text-white",
											)}
										>
											{result.spf.lookupCount}/10 Lookups
										</strong>
									</div>
									<div>
										<span className="text-text-sub-600 dark:text-white/45">Qualifier:</span>{" "}
										<strong className="font-mono text-text-strong-950 dark:text-white">
											{result.spf.qualifier || "None"}
										</strong>
									</div>
									{result.spf.includes.length > 0 && (
										<div className="col-span-2 truncate">
											<span className="text-text-sub-600 dark:text-white/45">Includes:</span>{" "}
											<span className="font-mono text-text-strong-950 dark:text-white">
												{result.spf.includes.join(", ")}
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* 3. DKIM Card */}
						<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
								<div className="flex items-center gap-2">
									<Icon name="key" className="size-4 text-text-strong-950 dark:text-white" />
									<h3 className="font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
										DKIM Signature (RFC 6376)
									</h3>
								</div>
								{result.dkim.status === "pass" ? (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-2.5 py-0.5 font-medium text-[12px] text-success-base dark:bg-emerald-500/10 dark:text-emerald-400">
										<Icon name="check-circle" className="size-3.5 shrink-0" />
										<span>Pass</span>
									</div>
								) : result.dkim.status === "warn" ? (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-2.5 py-0.5 font-medium text-[12px] text-warning-base dark:bg-amber-500/10 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-3.5 shrink-0" />
										<span>Weak Key</span>
									</div>
								) : (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-medium text-[12px] text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
										<Icon name="info-outline" className="size-3.5 shrink-0" />
										<span>Custom Selector</span>
									</div>
								)}
							</div>

							<div className="mt-3.5 space-y-3 text-[13px]">
								{result.dkim.rawRecord ? (
									<div className="relative rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 font-mono text-[12px] text-text-strong-950 break-all dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
										{result.dkim.rawRecord}
										<div className="mt-2 flex justify-end">
											<CompactButton.Root
												type="button"
												variant="ghost"
												size="medium"
												onClick={() => handleCopyValue(result.dkim.rawRecord || "", "dkim")}
											>
												<CompactButton.Icon
													as={Icon}
													name={copiedKey === "dkim" ? "check" : "copy"}
													className={copiedKey === "dkim" ? "text-emerald-500" : ""}
												/>
											</CompactButton.Root>
										</div>
									</div>
								) : (
									<p className="text-text-sub-600 dark:text-white/50">
										No public key on standard selectors. Enter your specific selector in the search box above.
									</p>
								)}

								<div className="grid grid-cols-2 gap-2 text-[12px]">
									<div>
										<span className="text-text-sub-600 dark:text-white/45">Selector:</span>{" "}
										<strong className="font-mono text-text-strong-950 dark:text-white">
											{result.dkim.selector || "None"}
										</strong>
									</div>
									<div>
										<span className="text-text-sub-600 dark:text-white/45">Key Size:</span>{" "}
										<strong className="font-mono text-text-strong-950 dark:text-white">
											{result.dkim.keyLength ? `${result.dkim.keyLength}-bit RSA` : "Unknown"}
										</strong>
									</div>
								</div>
							</div>
						</div>

						{/* 4. MX Routing Card */}
						<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
								<div className="flex items-center gap-2">
									<Icon name="server" className="size-4 text-text-strong-950 dark:text-white" />
									<h3 className="font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
										Mail Routing (MX)
									</h3>
								</div>
								{result.mx.status === "pass" ? (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-2.5 py-0.5 font-medium text-[12px] text-success-base dark:bg-emerald-500/10 dark:text-emerald-400">
										<Icon name="check-circle" className="size-3.5 shrink-0" />
										<span>Active</span>
									</div>
								) : (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-2.5 py-0.5 font-medium text-[12px] text-warning-base dark:bg-amber-500/10 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-3.5 shrink-0" />
										<span>No MX</span>
									</div>
								)}
							</div>

							<div className="mt-3.5 space-y-2 text-[13px]">
								{result.mx.records.length > 0 ? (
									<div className="space-y-1.5 font-mono text-[12px]">
										{result.mx.records.slice(0, 3).map((mx) => (
											<div
												key={mx.exchange}
												className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.02]"
											>
												<span className="truncate text-text-strong-950 dark:text-white">
													{mx.exchange}
												</span>
												<span className="text-text-sub-600 dark:text-white/40">
													Priority: {mx.priority}
												</span>
											</div>
										))}
									</div>
								) : (
									<p className="text-text-sub-600 dark:text-white/50">
										No MX records published for this domain.
									</p>
								)}
								{result.mx.provider && (
									<p className="font-mono text-[11.5px] text-text-sub-600 dark:text-white/45">
										Detected Provider:{" "}
										<strong className="text-text-strong-950 dark:text-white">
											{result.mx.provider}
										</strong>
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Diagnostics List Card */}
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="border-b border-stroke-soft-200 px-4 py-3 sm:px-5 dark:border-white/10">
							<h3 className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
								Health &amp; Security Diagnostics ({result.diagnostics.length})
							</h3>
						</div>

						<div className="divide-y divide-stroke-soft-200 dark:divide-white/5">
							{result.diagnostics.map((diag) => (
								<div
									key={diag.id}
									className="flex items-start justify-between gap-4 px-4 py-3 sm:px-5"
								>
									<div className="flex items-start gap-3">
										<div className="mt-0.5">
											{diag.status === "pass" && (
												<Icon name="check-circle" className="size-4 text-emerald-500" />
											)}
											{diag.status === "warn" && (
												<Icon name="alert-triangle" className="size-4 text-amber-500" />
											)}
											{diag.status === "fail" && (
												<Icon name="minus-circle" className="size-4 text-rose-500" />
											)}
											{diag.status === "info" && (
												<Icon name="info-outline" className="size-4 text-blue-500" />
											)}
										</div>
										<div>
											<p className="font-medium text-[13.5px] text-text-strong-950 dark:text-white">
												{diag.name}
											</p>
											<p className="text-[12.5px] text-text-sub-600 dark:text-white/55">
												{diag.message}
											</p>
											{diag.details && (
												<p className="mt-1 font-mono text-[11.5px] text-text-sub-600/80 dark:text-white/40">
													{diag.details}
												</p>
											)}
										</div>
									</div>

									{diag.status === "pass" && (
										<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-2.5 py-0.5 font-medium text-[12px] text-success-base dark:bg-emerald-500/10 dark:text-emerald-400">
											<Icon name="shield-check" className="size-3.5 shrink-0" />
											<span>Pass</span>
										</div>
									)}
									{diag.status === "warn" && (
										<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-2.5 py-0.5 font-medium text-[12px] text-warning-base dark:bg-amber-500/10 dark:text-amber-400">
											<Icon name="alert-triangle" className="size-3.5 shrink-0" />
											<span>Warning</span>
										</div>
									)}
									{diag.status === "fail" && (
										<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-2.5 py-0.5 font-medium text-[12px] text-error-base dark:bg-rose-500/10 dark:text-rose-400">
											<Icon name="minus-circle" className="size-3.5 shrink-0" />
											<span>Fail</span>
										</div>
									)}
									{diag.status === "info" && (
										<div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-medium text-[12px] text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
											<Icon name="info-outline" className="size-3.5 shrink-0" />
											<span>Info</span>
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
