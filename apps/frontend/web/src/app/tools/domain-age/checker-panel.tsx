"use client";

import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { type DomainAgeReport, runDomainAge } from "./check-api";

const PRESETS = [
	{ label: "google.com (Mature)", value: "google.com" },
	{ label: "github.com (Mature)", value: "github.com" },
	{ label: "stripe.com (Mature)", value: "stripe.com" },
	{ label: "reloop.sh", value: "reloop.sh" },
];

export function CheckerPanel() {
	const [domain, setDomain] = useState("google.com");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<DomainAgeReport | null>(null);
	const [copied, setCopied] = useState(false);
	const [showRawRdap, setShowRawRdap] = useState(false);

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
			const res = await runDomainAge(target, controller.signal);
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				(err as Error).message ||
					"Failed to check domain age. Please check domain formatting.",
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
		const report = `[Reloop Domain Age & Warmup Report]
Domain: ${result.domain}
Verdict: ${result.verdict.toUpperCase()}
Headline: ${result.headline}
Age: ${result.age.ageDays !== null ? `${result.age.ageDays} days` : "Unknown"}
Registered: ${result.age.createdAt ? new Date(result.age.createdAt).toLocaleDateString() : "Unknown"}
Registrar: ${result.registry.registrar || "Unknown"}
SPF: ${result.emailSetup.spf ? "Configured" : "Missing"}
DMARC: ${result.emailSetup.dmarc ? `Configured (${result.emailSetup.dmarcPolicy})` : "Missing"}
https://reloop.sh/tools/domain-age`;

		navigator.clipboard.writeText(report).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	// Calculate timeline position percentage (capped at 100%)
	const getTimelineProgress = (days: number | null): number => {
		if (days === null || days <= 0) return 3;
		if (days <= 7) return (days / 7) * 25;
		if (days <= 30) return 25 + ((days - 7) / 23) * 25;
		if (days <= 90) return 50 + ((days - 30) / 60) * 25;
		return Math.min(100, 75 + ((days - 90) / 275) * 25);
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
								<span>Querying RDAP...</span>
							</>
						) : (
							<>
								<Button.Icon as={Icon} name="search" className="size-3.5" />
								<span>Check Domain Age</span>
							</>
						)}
					</Button.Root>
				</form>
				<p className="mt-2.5 font-mono text-[11px] text-text-sub-600 dark:text-white/40">
					We query official ICANN RDAP registry endpoints and public email DNS. We do not send emails or scrape WHOIS.
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
					{/* Top Headline & Big Age Card */}
					<div
						className={cn(
							"rounded-2xl border p-6 shadow-xs sm:p-7 transition-colors",
							(result.verdict === "too_new" || result.verdict === "held" || result.verdict === "not_registered") &&
								"border-rose-500/30 bg-rose-500/[0.04] dark:border-rose-500/40 dark:bg-rose-500/[0.07]",
							(result.verdict === "cold" || result.verdict === "warming" || result.verdict === "unknown_age") &&
								"border-amber-500/30 bg-amber-500/[0.04] dark:border-amber-500/40 dark:bg-amber-500/[0.07]",
							(result.verdict === "established" || result.verdict === "mature") &&
								"border-emerald-500/30 bg-emerald-500/[0.04] dark:border-emerald-500/40 dark:bg-emerald-500/[0.07]",
						)}
					>
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
							<div>
								{/* Capsule Badge */}
								{result.verdict === "too_new" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-3 py-1 font-medium text-[12.5px] text-error-base dark:bg-rose-500/15 dark:text-rose-400">
										<Icon name="minus-circle" className="size-4 shrink-0" />
										<span>Too New to Send (0–7 Days)</span>
									</div>
								)}
								{result.verdict === "cold" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-3 py-1 font-medium text-[12.5px] text-warning-base dark:bg-amber-500/15 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-4 shrink-0" />
										<span>Cold Domain (8–30 Days)</span>
									</div>
								)}
								{result.verdict === "warming" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-3 py-1 font-medium text-[12.5px] text-warning-base dark:bg-amber-500/15 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-4 shrink-0" />
										<span>Warming Phase (31–90 Days)</span>
									</div>
								)}
								{result.verdict === "established" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-3 py-1 font-medium text-[12.5px] text-success-base dark:bg-emerald-500/15 dark:text-emerald-400">
										<Icon name="shield-check" className="size-4 shrink-0" />
										<span>Established (91–365 Days)</span>
									</div>
								)}
								{result.verdict === "mature" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-3 py-1 font-medium text-[12.5px] text-success-base dark:bg-emerald-500/15 dark:text-emerald-400">
										<Icon name="shield-check" className="size-4 shrink-0" />
										<span>Mature Domain (1+ Years Old)</span>
									</div>
								)}
								{result.verdict === "held" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-3 py-1 font-medium text-[12.5px] text-error-base dark:bg-rose-500/15 dark:text-rose-400">
										<Icon name="lock" className="size-4 shrink-0" />
										<span>Registry Suspended / Held</span>
									</div>
								)}
								{result.verdict === "not_registered" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-3 py-1 font-medium text-[12.5px] text-error-base dark:bg-rose-500/15 dark:text-rose-400">
										<Icon name="minus-circle" className="size-4 shrink-0" />
										<span>Unregistered Domain</span>
									</div>
								)}
								{result.verdict === "unknown_age" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-3 py-1 font-medium text-[12.5px] text-warning-base dark:bg-amber-500/15 dark:text-amber-400">
										<Icon name="info-outline" className="size-4 shrink-0" />
										<span>Registry Redacted Date</span>
									</div>
								)}

								<h2 className="mt-3 font-semibold text-[22px] text-text-strong-950 sm:text-[26px] tracking-tight dark:text-white">
									{result.headline}
								</h2>

								{/* Big Number Age Callout */}
								{result.age.ageDays !== null && (
									<div className="mt-2 flex flex-wrap items-baseline gap-2">
										<span className="font-semibold text-[19px] text-text-strong-950 sm:text-[22px] dark:text-white">
											Registered {result.age.ageDays === 0 ? "today" : `${result.age.ageDays.toLocaleString()} days ago`}
										</span>
										{result.age.createdAt && (
											<span className="text-[13.5px] text-text-sub-600 dark:text-white/50">
												({new Date(result.age.createdAt).toLocaleDateString("en-US", {
													month: "long",
													day: "numeric",
													year: "numeric",
												})})
											</span>
										)}
									</div>
								)}

								<p className="mt-2 max-w-2xl text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/70">
									{result.summary}
								</p>
								{result.domain !== result.registrableDomain && (
									<p className="mt-2 max-w-2xl text-[13.5px] text-text-sub-600 dark:text-white/55">
										Checked{" "}
										<span className="font-medium text-text-strong-950 dark:text-white">
											{result.registrableDomain}
										</span>{" "}
										(the registered domain). Subdomains like {result.domain} inherit
										that age — sending mail from them does not create a new
										registration date.
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

						{/* 📊 Visual Timeline Bar */}
						{result.age.ageDays !== null && (
							<div className="mt-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
								<div className="mb-2 flex items-center justify-between text-[11px] font-mono text-text-sub-600 uppercase tracking-wider dark:text-white/40">
									<span>Domain Warmup Stages</span>
									<span>Current Age: {result.age.ageDays}d</span>
								</div>

								{/* Segmented Timeline Track */}
								<div className="relative h-2.5 w-full overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/10">
									<div className="grid h-full grid-cols-4 divide-x divide-white/20 dark:divide-black/20">
										<div className="bg-rose-500/70" />
										<div className="bg-amber-500/70" />
										<div className="bg-blue-500/70" />
										<div className="bg-emerald-500/70" />
									</div>

									{/* Current Marker Pin */}
									<div
										className="absolute top-0 bottom-0 w-2.5 -ml-1 rounded-full bg-text-strong-950 shadow-md ring-2 ring-white dark:bg-white dark:ring-black"
										style={{ left: `${getTimelineProgress(result.age.ageDays)}%` }}
									/>
								</div>

								{/* Labels below segments */}
								<div className="mt-2.5 grid grid-cols-4 text-center font-mono text-[10.5px] text-text-sub-600 dark:text-white/50">
									<div className={result.verdict === "too_new" ? "font-semibold text-rose-500" : ""}>
										Too New (0–7d)
									</div>
									<div className={result.verdict === "cold" ? "font-semibold text-amber-500" : ""}>
										Cold (8–30d)
									</div>
									<div className={result.verdict === "warming" ? "font-semibold text-blue-500" : ""}>
										Warming (31–90d)
									</div>
									<div className={(result.verdict === "established" || result.verdict === "mature") ? "font-semibold text-emerald-500" : ""}>
										Established (90d+)
									</div>
								</div>
							</div>
						)}

						{/* Disclaimer */}
						<div className="mt-4 border-t border-stroke-soft-200/60 pt-3 dark:border-white/10 font-mono text-[11.5px] text-text-sub-600 dark:text-white/45">
							ℹ️ {result.disclaimer}
						</div>
					</div>

					{/* 🏛️ Two Side Cards: Email Authentication vs Registry & DNS */}
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
						{/* Card 1: Email Authentication Status */}
						<div className="lg:col-span-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
								<div className="flex items-center gap-2">
									<Icon name="lock" className="size-4 text-text-strong-950 dark:text-white" />
									<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
										Email Authentication Readiness
									</h3>
								</div>
								<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/40">
									DNS Records
								</span>
							</div>

							<div className="mt-4 space-y-3">
								<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
									<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
										SPF (Sender Policy Framework)
									</span>
									{result.emailSetup.spf ? (
										<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-emerald-600 dark:text-emerald-400">
											<Icon name="check" className="size-3.5" /> Published
										</span>
									) : (
										<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-rose-500">
											<Icon name="minus-circle" className="size-3.5" /> Missing
										</span>
									)}
								</div>

								<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
									<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
										DMARC Policy
									</span>
									{result.emailSetup.dmarc ? (
										<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-emerald-600 dark:text-emerald-400">
											<Icon name="shield-check" className="size-3.5" /> {result.emailSetup.dmarcPolicy || "Published"}
										</span>
									) : (
										<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-rose-500">
											<Icon name="minus-circle" className="size-3.5" /> Missing
										</span>
									)}
								</div>

								<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
									<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
										Inbound Mailbox (MX)
									</span>
									{result.emailSetup.mx ? (
										<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-emerald-600 dark:text-emerald-400">
											<Icon name="check" className="size-3.5" /> Active
										</span>
									) : (
										<span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-amber-600 dark:text-amber-400">
											<Icon name="info-outline" className="size-3.5" /> No MX
										</span>
									)}
								</div>

								<p className="text-[12px] text-text-sub-600 leading-relaxed dark:text-white/50 pt-1">
									Age and authentication are separate signals. Valid authentication is required, but it does not erase the coldness of a brand-new domain.
								</p>
							</div>
						</div>

						{/* Card 2: Registry & Nameservers */}
						<div className="lg:col-span-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
								<div className="flex items-center gap-2">
									<Icon name="server" className="size-4 text-text-strong-950 dark:text-white" />
									<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
										Registry &amp; Nameserver Setup
									</h3>
								</div>
								<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/40">
									RDAP
								</span>
							</div>

							<div className="mt-4 space-y-3">
								<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
									<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
										Domain Registrar
									</span>
									<p className="mt-0.5 font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
										{result.registry.registrar || "Not disclosed by registry"}
									</p>
								</div>

								<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
									<div className="flex items-center justify-between">
										<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
											DNS Provider &amp; Kind
										</span>
										{result.nameservers.kind === "production" && (
											<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
												Production DNS
											</span>
										)}
										{result.nameservers.kind === "registrar_default" && (
											<span className="rounded-full bg-blue-500/10 px-2 py-0.5 font-mono text-[10.5px] text-blue-600 dark:text-blue-400 font-medium">
												Registrar Default
											</span>
										)}
										{result.nameservers.kind === "parking" && (
											<span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[10.5px] text-amber-600 dark:text-amber-400 font-medium">
												Parked Nameservers
											</span>
										)}
									</div>
									<p className="mt-0.5 font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
										{result.nameservers.provider || "Custom Nameservers"}
									</p>
									{result.nameservers.hosts.length > 0 && (
										<div className="mt-1 font-mono text-[11px] text-text-sub-600 dark:text-white/45 truncate">
											{result.nameservers.hosts.slice(0, 2).join(", ")}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* ⚠️ Warnings Callout (if any) */}
					{result.warnings.length > 0 && (
						<div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-4 dark:border-amber-500/40 dark:bg-amber-500/[0.07]">
							<div className="flex items-start gap-3">
								<Icon name="alert-triangle" className="size-4.5 text-amber-500 shrink-0 mt-0.5" />
								<div className="space-y-1">
									<h4 className="font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
										Important Deliverability Notes
									</h4>
									<ul className="space-y-0.5 text-[12.5px] text-text-sub-600 dark:text-white/70">
										{result.warnings.map((w) => (
											<li key={w}>• {w}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					)}

					{/* 🚀 Next Steps & Reloop Recommendation */}
					<div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5 sm:flex-row sm:items-center dark:border-blue-500/30 dark:bg-blue-500/[0.08]">
						<div className="space-y-1">
							<span className="font-mono text-[10.5px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">
								Sending Recommendation
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

							<Link href={`/tools/spoof-checker?domain=${encodeURIComponent(result.domain)}`}>
								<Button.Root variant="neutral" mode="stroke" size="small">
									<Button.Icon as={Icon} name="shield-check" />
									<span>Spoof Checker</span>
								</Button.Root>
							</Link>

							<Link href={`/tools/auth-checker?domain=${encodeURIComponent(result.domain)}`}>
								<Button.Root variant="neutral" mode="stroke" size="small">
									<Button.Icon as={Icon} name="lock" />
									<span>Auth Audit</span>
								</Button.Root>
							</Link>
						</div>
					</div>

					{/* Collapsible Raw RDAP Data */}
					<div className="pt-2">
						<button
							type="button"
							onClick={() => setShowRawRdap((prev) => !prev)}
							className="font-mono text-[12px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							{showRawRdap ? "▲ Hide raw RDAP details" : "▼ View raw RDAP registration metadata"}
						</button>

						{showRawRdap && (
							<div className="mt-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 font-mono text-[11.5px] text-text-strong-950 space-y-1.5 dark:border-white/10 dark:bg-white/[0.02] dark:text-white">
								<div><strong>Registrable Domain:</strong> {result.registrableDomain}</div>
								<div><strong>Created At:</strong> {result.age.createdAt || "None"}</div>
								<div><strong>Expires At:</strong> {result.age.expiresAt || "None"}</div>
								<div><strong>Registrar:</strong> {result.registry.registrar || "None"}</div>
								<div><strong>Registry Status:</strong> {result.registry.status.join(", ") || "None"}</div>
								<div><strong>Nameservers:</strong> {result.nameservers.hosts.join(", ") || "None"}</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
