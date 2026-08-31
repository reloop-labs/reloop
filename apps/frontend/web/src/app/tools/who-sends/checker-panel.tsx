"use client";

import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { type WhoSendsReport, runWhoSends } from "./check-api";

const PRESETS = [
	{ label: "stripe.com (Split)", value: "stripe.com" },
	{ label: "github.com (Split)", value: "github.com" },
	{ label: "reloop.sh", value: "reloop.sh" },
	{ label: "google.com (Single)", value: "google.com" },
	{ label: "apple.com", value: "apple.com" },
];

export function CheckerPanel() {
	const [domain, setDomain] = useState("stripe.com");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<WhoSendsReport | null>(null);
	const [copied, setCopied] = useState(false);
	const [showRawRecord, setShowRawRecord] = useState(false);

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
			const res = await runWhoSends(target, controller.signal);
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				(err as Error).message ||
					"Failed to analyze sender fingerprint. Please verify the domain name.",
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
		const senderNames = result.senders.map((s) => s.vendor).join(", ");
		const report = `[Reloop Sender Fingerprint]
Domain: ${result.domain}
Verdict: ${result.verdict.toUpperCase()}
Headline: ${result.headline}
Inbox Provider: ${result.inbox.provider || "None (No MX)"}
Authorized Senders: ${senderNames || "None named"}
SPF Record: ${result.spf.rawRecord || "none"}
https://reloop.sh/tools/who-sends`;

		navigator.clipboard.writeText(report).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
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
								placeholder="Enter domain or URL (e.g. stripe.com, github.com)"
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
								<span>Analyzing Stack...</span>
							</>
						) : (
							<>
								<Button.Icon as={Icon} name="search" className="size-3.5" />
								<span>Discover Senders</span>
							</>
						)}
					</Button.Root>
				</form>
				<p className="mt-2.5 font-mono text-[11px] text-text-sub-600 dark:text-white/40">
					We inspect public MX, SPF includes, nested delegations, and DKIM selectors. We do not send email.
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
							result.verdict === "wide_open" &&
								"border-rose-500/30 bg-rose-500/[0.04] dark:border-rose-500/40 dark:bg-rose-500/[0.07]",
							(result.verdict === "unpublished" || result.verdict === "opaque") &&
								"border-amber-500/30 bg-amber-500/[0.04] dark:border-amber-500/40 dark:bg-amber-500/[0.07]",
							(result.verdict === "split_stack" || result.verdict === "crowded" || result.verdict === "send_only") &&
								"border-blue-500/30 bg-blue-500/[0.04] dark:border-blue-500/40 dark:bg-blue-500/[0.07]",
							result.verdict === "single_stack" &&
								"border-emerald-500/30 bg-emerald-500/[0.04] dark:border-emerald-500/40 dark:bg-emerald-500/[0.07]",
						)}
					>
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
							<div>
								{/* Capsule Badge */}
								{result.verdict === "single_stack" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-success-lighter px-3 py-1 font-medium text-[12.5px] text-success-base dark:bg-emerald-500/15 dark:text-emerald-400">
										<Icon name="shield-check" className="size-4 shrink-0" />
										<span>Single Provider Stack</span>
									</div>
								)}
								{result.verdict === "split_stack" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 font-medium text-[12.5px] text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
										<Icon name="server" className="size-4 shrink-0" />
										<span>Split Inbound / Outbound Stack</span>
									</div>
								)}
								{result.verdict === "crowded" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-3 py-1 font-medium text-[12.5px] text-warning-base dark:bg-amber-500/15 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-4 shrink-0" />
										<span>Crowded Sender Roster (4+ ESPs)</span>
									</div>
								)}
								{result.verdict === "send_only" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 font-medium text-[12.5px] text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
										<Icon name="mail-send" className="size-4 shrink-0" />
										<span>Outbound Only (No Mailbox)</span>
									</div>
								)}
								{result.verdict === "opaque" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-3 py-1 font-medium text-[12.5px] text-warning-base dark:bg-amber-500/15 dark:text-amber-400">
										<Icon name="lock" className="size-4 shrink-0" />
										<span>Opaque / Dedicated IP Infrastructure</span>
									</div>
								)}
								{result.verdict === "unpublished" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-warning-lighter px-3 py-1 font-medium text-[12.5px] text-warning-base dark:bg-amber-500/15 dark:text-amber-400">
										<Icon name="alert-triangle" className="size-4 shrink-0" />
										<span>No SPF Published</span>
									</div>
								)}
								{result.verdict === "wide_open" && (
									<div className="inline-flex items-center gap-1.5 rounded-full bg-error-lighter px-3 py-1 font-medium text-[12.5px] text-error-base dark:bg-rose-500/15 dark:text-rose-400">
										<Icon name="minus-circle" className="size-4 shrink-0" />
										<span>Wide Open SPF (+all)</span>
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
									<span>{copied ? "Copied" : "Copy summary"}</span>
								</Button.Root>
							</div>
						</div>

						{/* Disclaimer Strip */}
						<div className="mt-4 border-t border-stroke-soft-200/60 pt-3 dark:border-white/10 font-mono text-[11.5px] text-text-sub-600 dark:text-white/45">
							ℹ️ {result.disclaimer}
						</div>
					</div>

					{/* 🏛️ The Two-Column Roster (Inbox vs. Who Can Send) */}
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
						{/* Column 1: Inbound Mailbox (MX) */}
						<div className="lg:col-span-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
								<div className="flex items-center gap-2">
									<Icon name="mail-receive" className="size-4 text-text-strong-950 dark:text-white" />
									<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
										Inbound Mailbox
									</h3>
								</div>
								<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/40">
									MX Record
								</span>
							</div>

							<div className="mt-4 space-y-3">
								{result.inbox.provider ? (
									<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
										<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
											Primary Mailbox Provider
										</span>
										<p className="mt-1 font-semibold text-[17px] text-text-strong-950 dark:text-white">
											{result.inbox.provider}
										</p>
										<div className="mt-3 space-y-1.5 font-mono text-[11.5px]">
											{result.inbox.exchanges.slice(0, 3).map((ex) => (
												<div key={ex} className="truncate text-text-sub-600 dark:text-white/55">
													↳ {ex}
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 text-center dark:border-white/10 dark:bg-white/[0.02]">
										<Icon name="alert-triangle" className="size-5 mx-auto text-amber-500 mb-1" />
										<p className="font-medium text-[13.5px] text-text-strong-950 dark:text-white">
											No MX Records Found
										</p>
										<p className="mt-1 text-[12px] text-text-sub-600 dark:text-white/50">
											This domain does not receive inbound mail.
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Column 2: Who Can Send (Outbound Senders Roster) */}
						<div className="lg:col-span-7 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
							<div className="flex items-center justify-between border-b border-stroke-soft-200 pb-3 dark:border-white/10">
								<div className="flex items-center gap-2">
									<Icon name="mail-send" className="size-4 text-text-strong-950 dark:text-white" />
									<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
										Who Can Send ({result.senders.length})
									</h3>
								</div>
								<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/40">
									SPF &amp; DKIM Senders
								</span>
							</div>

							<div className="mt-4 space-y-3">
								{result.senders.length > 0 ? (
									result.senders.map((sender) => (
										<div
											key={sender.vendor}
											className="flex flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.02]"
										>
											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-2">
													<h4 className="font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
														{sender.vendor}
													</h4>

													{/* Role Tag */}
													{sender.role === "inbox_and_send" && (
														<span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
															Inbox &amp; Send
														</span>
													)}
													{sender.role === "send" && (
														<span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 font-mono text-[10.5px] text-blue-600 dark:text-blue-400 font-medium">
															Outbound ESP
														</span>
													)}
													{sender.role === "dkim_only" && (
														<span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 font-mono text-[10.5px] text-purple-600 dark:text-purple-400 font-medium">
															DKIM Only
														</span>
													)}

													{/* Leftover Tag */}
													{sender.leftover && (
														<span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[10.5px] text-amber-600 dark:text-amber-400 font-medium">
															<Icon name="alert-triangle" className="size-3" /> Likely Leftover
														</span>
													)}
												</div>

												{/* Evidence line */}
												<div className="mt-1 font-mono text-[11.5px] text-text-sub-600 dark:text-white/45">
													{sender.evidence.map((ev) => ev.value).join(", ")}
												</div>
											</div>

											<div className="shrink-0">
												<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/40">
													{sender.confidence === "high" && "Verified SPF"}
													{sender.confidence === "medium" && "DKIM Signature"}
													{sender.confidence === "low" && "Hostname"}
												</span>
											</div>
										</div>
									))
								) : (
									<p className="text-center py-6 text-[13px] text-text-sub-600 dark:text-white/45">
										No third-party sending providers were named in public DNS.
									</p>
								)}

								{/* Unnamed Senders Row */}
								{(result.unnamed.ip4.length > 0 || result.unnamed.includes.length > 0) && (
									<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/25 p-3 font-mono text-[11.5px] text-text-sub-600 dark:border-white/10 dark:text-white/50">
										<span className="font-semibold text-text-strong-950 dark:text-white">
											Also Authorized (Unnamed Infrastructure):{" "}
										</span>
										{[...result.unnamed.ip4, ...result.unnamed.includes].join(", ")}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* 🚀 Next Steps & Reloop Consolidation CTA */}
					<div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5 sm:flex-row sm:items-center dark:border-blue-500/30 dark:bg-blue-500/[0.08]">
						<div className="space-y-1">
							<span className="font-mono text-[10.5px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">
								Infrastructure Recommendation
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

					{/* Collapsible Raw SPF Record */}
					<div className="pt-2">
						<button
							type="button"
							onClick={() => setShowRawRecord((prev) => !prev)}
							className="font-mono text-[12px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							{showRawRecord ? "▲ Hide raw SPF record" : "▼ View raw SPF record for proof"}
						</button>

						{showRawRecord && (
							<div className="mt-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 font-mono text-[11.5px] text-text-strong-950 break-all dark:border-white/10 dark:bg-white/[0.02] dark:text-white">
								<span className="text-text-sub-600 dark:text-white/40">SPF ({result.domain}):</span>
								<p className="mt-0.5">{result.spf.rawRecord || "No SPF record found"}</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
