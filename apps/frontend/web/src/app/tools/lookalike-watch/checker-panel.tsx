"use client";

import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { type LookalikeWatchReport, runLookalikeWatch } from "./check-api";

const PRESETS = [
	{ label: "stripe.com", value: "stripe.com" },
	{ label: "github.com", value: "github.com" },
	{ label: "reloop.sh", value: "reloop.sh" },
	{ label: "google.com", value: "google.com" },
];

export function CheckerPanel() {
	const [domain, setDomain] = useState("stripe.com");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<LookalikeWatchReport | null>(null);
	const [copied, setCopied] = useState(false);

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
			const res = await runLookalikeWatch(target, controller.signal);
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				(err as Error).message ||
					"Failed to scan lookalike domains. Please check domain formatting.",
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
		const report = `[Reloop Lookalike Domain Watch Report]
Domain: ${result.domain}
Verdict: ${result.verdict.toUpperCase()}
Headline: ${result.headline}
Scanned: ${result.scanned} permutations
Active Hits Found: ${result.hits.length}
${result.hits.map((h) => `- ${h.name} (${h.trick}) -> ${h.mailCapable ? "Can Send Mail (MX/SPF)" : "Parked/DNS"}`).join("\n")}
https://reloop.sh/tools/lookalike-watch`;

		navigator.clipboard.writeText(report).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const firstMailTwin = result?.hits.find((h) => h.mailCapable);

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
								placeholder="Enter domain (e.g. acme.com, stripe.com)"
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
								<span>Scanning DNS Permutations...</span>
							</>
						) : (
							<>
								<Button.Icon as={Icon} name="search" className="size-3.5" />
								<span>Scan Lookalikes</span>
							</>
						)}
					</Button.Root>
				</form>
				<p className="mt-2.5 font-mono text-[11px] text-text-sub-600 dark:text-white/40">
					We generate bounded candidate permutations (TLDs, typos, affixes, homoglyphs) and query public DNS. We never send test emails or scrape WHOIS.
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
					{/* Top Headline Card */}
					<div
						className={cn(
							"rounded-2xl border p-6 shadow-xs sm:p-7 transition-colors",
							result.verdict === "mail_twins" &&
								"border-rose-500/30 bg-rose-500/[0.04] dark:border-rose-500/40 dark:bg-rose-500/[0.07]",
							result.verdict === "parked_twins" &&
								"border-amber-500/30 bg-amber-500/[0.04] dark:border-amber-500/40 dark:bg-amber-500/[0.07]",
							result.verdict === "clear_scan" &&
								"border-emerald-500/30 bg-emerald-500/[0.04] dark:border-emerald-500/40 dark:bg-emerald-500/[0.07]",
						)}
					>
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
							<div>
								{/* Capsule Badge */}
								{result.verdict === "mail_twins" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-3 py-1 font-medium text-[12.5px] text-error-base dark:bg-rose-500/15 dark:text-rose-400">
										<Icon name="alert-triangle" className="size-4 shrink-0" />
										<span>Mail-Ready Lookalikes Detected</span>
									</div>
								)}
								{result.verdict === "parked_twins" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-3 py-1 font-medium text-[12.5px] text-warning-base dark:bg-amber-500/15 dark:text-amber-400">
										<Icon name="info-outline" className="size-4 shrink-0" />
										<span>Registered Twins (No Mail Setup)</span>
									</div>
								)}
								{result.verdict === "clear_scan" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-3 py-1 font-medium text-[12.5px] text-success-base dark:bg-emerald-500/15 dark:text-emerald-400">
										<Icon name="shield-check" className="size-4 shrink-0" />
										<span>No Common Lookalikes Found</span>
									</div>
								)}

								<h2 className="mt-3 font-semibold text-[22px] text-text-strong-950 sm:text-[26px] tracking-tight dark:text-white">
									{result.headline}
								</h2>

								<p className="mt-2 max-w-2xl text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/70">
									{result.summary}
								</p>
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
									<span>{copied ? "Copied" : "Copy report"}</span>
								</Button.Root>
							</div>
						</div>

						{/* Disclaimer Strip */}
						<div className="mt-4 border-t border-stroke-soft-200/60 pt-3 dark:border-white/10 font-mono text-[11.5px] text-text-sub-600 dark:text-white/45">
							ℹ️ {result.disclaimer}
						</div>
					</div>

					{/* 🎭 Phishing Simulation Card (Rendered if mail_twins) */}
					{result.verdict === "mail_twins" && firstMailTwin && (
						<div className="rounded-2xl border border-rose-500/30 bg-bg-white-0 p-5 shadow-xs dark:border-rose-500/30 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
								<div className="flex items-center gap-2">
									<Icon name="mail" className="size-4 text-rose-500" />
									<h3 className="font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
										Simulated Phishing Attack Vector
									</h3>
								</div>
								<span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 font-mono text-[11px] text-rose-600 dark:text-rose-400 font-medium">
									Active Threat Vector
								</span>
							</div>

							<div className="mt-4 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 font-mono text-[12px] space-y-1.5 dark:border-white/10 dark:bg-white/[0.02]">
								<div className="flex items-baseline gap-2">
									<span className="text-text-sub-600 dark:text-white/40">From:</span>
									<span className="font-semibold text-rose-600 dark:text-rose-400">
										Security Support &lt;support@{firstMailTwin.name}&gt;
									</span>
								</div>
								<div className="flex items-baseline gap-2">
									<span className="text-text-sub-600 dark:text-white/40">Subject:</span>
									<span className="text-text-strong-950 dark:text-white">
										Action Required: Verify payroll &amp; login credentials
									</span>
								</div>
							</div>

							<p className="mt-3 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
								Recipients see your brand name in the address and assume it is authentic. Because <code className="font-mono text-[11.5px] text-text-strong-950 dark:text-white">{firstMailTwin.name}</code> is a distinct registered domain, strict DMARC (<code className="font-mono text-[11px]">p=reject</code>) on <code className="font-mono text-[11.5px] text-text-strong-950 dark:text-white">{result.registrableDomain}</code> will <strong>not</strong> prevent delivery of this message.
							</p>
						</div>
					)}

					{/* 📋 Roster of Detected Lookalikes */}
					<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
							<div className="flex items-center gap-2">
								<Icon name="server" className="size-4 text-text-strong-950 dark:text-white" />
								<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
									Detected Lookalike Domains ({result.hits.length} of {result.scanned} scanned)
								</h3>
							</div>
							<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/40">
								DNS Records
							</span>
						</div>

						{result.hits.length === 0 ? (
							<div className="py-8 text-center">
								<Icon name="shield-check" className="mx-auto size-8 text-emerald-500/80" />
								<p className="mt-2 font-medium text-[14px] text-text-strong-950 dark:text-white">
									No common lookalike domains were active in this scan.
								</p>
								<p className="mt-1 text-[12.5px] text-text-sub-600 dark:text-white/50">
									Tested {result.scanned} permutations across alternate TLDs, common hyphens, typos, and homoglyphs.
								</p>
							</div>
						) : (
							<div className="mt-4 divide-y divide-stroke-soft-200/60 dark:divide-white/5">
								{result.hits.map((hit) => (
									<div
										key={hit.name}
										className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
									>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<span className="font-mono font-medium text-[13.5px] text-text-strong-950 dark:text-white">
													{hit.name}
												</span>
												{hit.unicodeName && (
													<span className="font-mono text-[12px] text-text-sub-600 dark:text-white/45">
														({hit.unicodeName})
													</span>
												)}

												{/* Trick Badge */}
												{hit.trick === "affix" && (
													<span className="rounded-full bg-bg-weak-50 px-2 py-0.5 font-mono text-[10.5px] text-text-sub-600 dark:bg-white/10 dark:text-white/60">
														Affix / Hyphen
													</span>
												)}
												{hit.trick === "tld" && (
													<span className="rounded-full bg-bg-weak-50 px-2 py-0.5 font-mono text-[10.5px] text-text-sub-600 dark:bg-white/10 dark:text-white/60">
														Alternative TLD
													</span>
												)}
												{hit.trick === "typo" && (
													<span className="rounded-full bg-bg-weak-50 px-2 py-0.5 font-mono text-[10.5px] text-text-sub-600 dark:bg-white/10 dark:text-white/60">
														Typo / Omission
													</span>
												)}
												{hit.trick === "homoglyph" && (
													<span className="rounded-full bg-bg-weak-50 px-2 py-0.5 font-mono text-[10.5px] text-text-sub-600 dark:bg-white/10 dark:text-white/60">
														Homoglyph
													</span>
												)}
											</div>

											<div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-text-sub-600 dark:text-white/45">
												<span>MX: {hit.mx ? "Yes" : "No"}</span>
												<span>•</span>
												<span>SPF: {hit.spf ? "Yes" : "No"}</span>
											</div>
										</div>

										<div className="flex shrink-0 items-center gap-2">
											{hit.mailCapable ? (
												<span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-rose-600 dark:text-rose-400">
													<Icon name="alert-triangle" className="size-3" />
													Can Send Mail
												</span>
											) : (
												<span className="inline-flex items-center gap-1 rounded-full bg-bg-weak-50 px-2.5 py-1 font-mono text-[11px] text-text-sub-600 dark:bg-white/5 dark:text-white/45">
													Parked / DNS Only
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* 🛡️ Next Steps & Action Recommendation */}
					<div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5 sm:flex-row sm:items-center dark:border-blue-500/30 dark:bg-blue-500/[0.08]">
						<div className="space-y-1">
							<span className="font-mono text-[10.5px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">
								Defense Recommendation
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
									<span>Get Protected</span>
									<Button.Icon as={Icon} name="arrow-right" />
								</a>
							</Button.Root>

							<Link href={`/tools/spoof-checker?domain=${encodeURIComponent(result.domain)}`}>
								<Button.Root variant="neutral" mode="stroke" size="small">
									<Button.Icon as={Icon} name="shield-check" />
									<span>Spoof Checker</span>
								</Button.Root>
							</Link>

							<Link href={`/tools/domain-age?domain=${encodeURIComponent(result.domain)}`}>
								<Button.Root variant="neutral" mode="stroke" size="small">
									<Button.Icon as={Icon} name="globe" />
									<span>Domain Age</span>
								</Button.Root>
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
