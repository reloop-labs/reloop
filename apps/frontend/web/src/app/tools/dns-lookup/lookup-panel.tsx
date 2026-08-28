"use client";

import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as CompactButton from "@reloop/ui/compact-button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
	type DnsLookupResponse,
	type DnsRecordType,
	runDnsLookup,
} from "./check-api";
import { TableFooter } from "./table-footer";

const PRESETS = [
	{ label: "stripe.com", value: "stripe.com" },
	{ label: "a:github.com", value: "a:github.com" },
	{ label: "mx:google.com", value: "mx:google.com" },
	{ label: "dmarc:apple.com", value: "dmarc:apple.com" },
	{ label: "txt:cloudflare.com", value: "txt:cloudflare.com" },
	{ label: "1.1.1.1", value: "1.1.1.1" },
];

const RECORD_TABS: Array<{ id: string; label: string }> = [
	{ id: "all", label: "All Records" },
	{ id: "A", label: "A" },
	{ id: "AAAA", label: "AAAA" },
	{ id: "MX", label: "MX" },
	{ id: "TXT", label: "TXT" },
	{ id: "CNAME", label: "CNAME" },
	{ id: "NS", label: "NS" },
	{ id: "SOA", label: "SOA" },
	{ id: "CAA", label: "CAA" },
	{ id: "PTR", label: "PTR" },
];

const kbdClassName = cn(
	"inline-flex h-5 items-center justify-center rounded border border-stroke-soft-200 bg-bg-weak-50 px-1 font-mono text-[10px] text-text-sub-600 shadow-xs",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white/70",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

function formatTtl(ttl: number | null): string {
	if (ttl === null || ttl === undefined) return "—";
	if (ttl < 60) return `${ttl}s`;
	if (ttl < 3600) return `${Math.round(ttl / 60)}m (${ttl}s)`;
	return `${Math.round(ttl / 3600)}h (${ttl}s)`;
}

function getRecordCapsuleClass(type: string): string {
	switch (type.toUpperCase()) {
		case "A":
		case "AAAA":
			return "bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400";
		case "MX":
			return "bg-success-lighter text-success-base dark:bg-emerald-500/10 dark:text-emerald-400";
		case "TXT":
			return "bg-warning-lighter text-warning-base dark:bg-amber-500/10 dark:text-amber-400";
		case "CNAME":
			return "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400";
		case "PTR":
		case "CAA":
			return "bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400";
		default:
			return "bg-bg-weak-50 text-text-sub-600 dark:bg-white/10 dark:text-white/70";
	}
}

export function LookupPanel() {
	const [input, setInput] = useState("stripe.com");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<DnsLookupResponse | null>(null);
	const [activeTab, setActiveTab] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [copied, setCopied] = useState(false);
	const [copiedItem, setCopiedItem] = useState<string | null>(null);

	const searchInputRef = useRef<HTMLInputElement>(null);
	const abortRef = useRef<AbortController | null>(null);

	const executeLookup = async (targetValue: string, recordType?: DnsRecordType) => {
		const target = targetValue.trim();
		if (!target) return;

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setIsLoading(true);
		setError(null);

		try {
			const res = await runDnsLookup(target, recordType, controller.signal);
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				(err as Error).message ||
					"Failed to query DNS records. Check your connection.",
			);
		} finally {
			if (!controller.signal.aborted) setIsLoading(false);
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === "/" &&
				document.activeElement?.tagName !== "INPUT" &&
				document.activeElement?.tagName !== "TEXTAREA"
			) {
				e.preventDefault();
				searchInputRef.current?.focus();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			abortRef.current?.abort();
		};
	}, []);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		executeLookup(input);
	};

	const handleCopyReport = () => {
		if (!result) return;
		const report = `[Reloop DNS Lookup Report]
Query: ${result.query}
Domain: ${result.domain}
DNS Provider: ${result.provider?.name || "Standard DNS"}
Nameserver: ${result.nameserver || "None"}
Records: ${result.records.length}
Latency: ${result.responseTimeMs}ms
DMARC Policy: ${result.summary.dmarcPolicy || "none"}
SPF Record: ${result.summary.spfRecord || "none"}
https://reloop.sh/tools/dns-lookup`;

		navigator.clipboard.writeText(report).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const handleCopyValue = (text: string, key: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedItem(key);
			setTimeout(() => setCopiedItem(null), 2000);
		});
	};

	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const filteredRecords = (result?.records || []).filter((item) => {
		const matchesTab =
			activeTab === "all" || item.type.toUpperCase() === activeTab.toUpperCase();

		const matchesSearch =
			!searchQuery ||
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.type.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesTab && matchesSearch;
	});

	const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
	const page = Math.min(currentPage, totalPages);
	const paginatedRecords = filteredRecords.slice(
		(page - 1) * pageSize,
		page * pageSize,
	);

	return (
		<div className="mx-auto max-w-5xl">
			{/* Preset Bar & CTA */}
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/35">
						Try Presets:
					</span>
					{PRESETS.map((preset) => (
						<button
							key={preset.label}
							type="button"
							onClick={() => {
								setInput(preset.value);
								executeLookup(preset.value);
							}}
							className={cn(
								"rounded-lg px-2.5 py-1 font-mono text-[11.5px] transition-colors",
								input === preset.value
									? "bg-text-strong-950 font-medium text-white shadow-xs dark:bg-white dark:text-black"
									: "border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-text-strong-950 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white dark:hover:text-white",
							)}
						>
							{preset.label}
						</button>
					))}
				</div>

				<FancyButton.Root
					type="button"
					variant="neutral"
					size="xsmall"
					onClick={() => executeLookup(input)}
					className="shrink-0"
				>
					<FancyButton.Icon as={Icon} name="sparkles" />
					<span>Instant Lookup</span>
				</FancyButton.Root>
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
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Enter domain, IP, or prefix (e.g. ohraya.com, a:ohraya.com, mx:google.com)"
								disabled={isLoading}
							/>
						</Input.Wrapper>
					</Input.Root>

					<Button.Root
						type="submit"
						variant="primary"
						mode="filled"
						size="small"
						disabled={isLoading || !input.trim()}
						className="shrink-0"
					>
						{isLoading ? (
							<>
								<Spinner size={14} />
								<span>Querying DNS...</span>
							</>
						) : (
							<>
								<Button.Icon as={Icon} name="search" className="size-3.5" />
								<span>DNS Lookup</span>
							</>
						)}
					</Button.Root>
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

			{/* Result View */}
			{result && (
				<div className="mt-6 space-y-6">
					{/* Lead Gen Banner */}
					<div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5 sm:flex-row sm:items-center dark:border-blue-500/30 dark:bg-blue-500/[0.08]">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-medium text-[12px] text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
									<Icon name="shield-check" className="size-3.5 shrink-0" />
									<span>Email Deliverability</span>
								</div>
								<span className="text-[12px] text-text-sub-600 dark:text-white/50">
									From p=none to p=reject, safely
								</span>
							</div>
							<h3 className="font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
								Protect your sending domain reputation with Reloop
							</h3>
							<p className="max-w-xl text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
								Continuous DNS monitoring, automated SPF/DKIM/DMARC alignment, and instant alerts when records drift.
							</p>
						</div>

						<Link href="/dashboard/signup" className="shrink-0">
							<Button.Root variant="primary" mode="filled" size="small">
								<span>Start Free Trial</span>
								<Button.Icon as={Icon} name="arrow-right" />
							</Button.Root>
						</Link>
					</div>

					{/* Summary Header Card */}
					<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="flex flex-col justify-between gap-4 border-b border-stroke-soft-200 pb-5 sm:flex-row sm:items-center dark:border-white/10">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
									<Icon name="globe" className="size-5" />
								</div>
								<div>
									<div className="flex items-center gap-2.5">
										<h2 className="font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
											{result.domain}
										</h2>
										<div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-medium text-[12px] text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
											<Icon name="check" className="size-3.5 shrink-0" />
											<span>{result.records.length} records</span>
										</div>
									</div>
									<p className="mt-0.5 font-mono text-[12px] text-text-sub-600 dark:text-white/45">
										Provider:{" "}
										<span className="text-text-strong-950 dark:text-white">
											{result.provider?.name || "Standard DNS"}
										</span>
										{result.nameserver && (
											<>
												{" "}· NS:{" "}
												<span className="text-text-strong-950 dark:text-white">
													{result.nameserver}
												</span>
											</>
										)}
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

								<Link href={`/tools/auth-checker?domain=${encodeURIComponent(result.domain)}`}>
									<Button.Root variant="neutral" mode="stroke" size="small">
										<Button.Icon as={Icon} name="lock" />
										<span>Auth Check</span>
									</Button.Root>
								</Link>
							</div>
						</div>

						{/* Stat Metrics Grid */}
						<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
								<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
									Query Duration
								</span>
								<p className="mt-1 font-mono font-semibold text-[16px] text-emerald-600 dark:text-emerald-400">
									{result.responseTimeMs} ms
								</p>
							</div>

							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
								<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
									DMARC Policy
								</span>
								<p className="mt-1 font-mono font-semibold text-[15px] text-text-strong-950 dark:text-white">
									{result.summary.dmarcPolicy ? `p=${result.summary.dmarcPolicy}` : "None"}
								</p>
							</div>

							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
								<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
									SPF Status
								</span>
								<p className="mt-1 font-mono font-semibold text-[15px] text-text-strong-950 dark:text-white">
									{result.summary.hasSpf ? "Published" : "Missing"}
								</p>
							</div>

							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
								<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
									Mail Exchange (MX)
								</span>
								<p className="mt-1 font-mono font-semibold text-[15px] text-text-strong-950 dark:text-white">
									{result.summary.hasMx ? "Active" : "None"}
								</p>
							</div>
						</div>
					</div>

					{/* Health & Security Diagnostics */}
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="border-b border-stroke-soft-200 px-4 py-3 sm:px-5 dark:border-white/10">
							<h3 className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
								Health &amp; Security Diagnostics
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

					{/* Records Table Card */}
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						{/* Table Header Controls */}
						<div className="flex flex-col gap-3 border-b border-stroke-soft-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
							<div className="flex flex-wrap items-center gap-1">
								{RECORD_TABS.map((tab) => {
									const count =
										tab.id === "all"
											? result.records.length
											: result.records.filter((r) => r.type.toUpperCase() === tab.id).length;
									if (count === 0 && tab.id !== "all") return null;

									const isActive = activeTab === tab.id;
									return (
										<button
											key={tab.id}
											type="button"
											onClick={() => {
												setActiveTab(tab.id);
												setCurrentPage(1);
											}}
											className={cn(
												"flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[12px] transition-colors",
												isActive
													? "bg-text-strong-950 font-medium text-white dark:bg-white dark:text-black"
													: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
											)}
										>
											<span>{tab.label}</span>
											<span
												className={cn(
													"rounded-full px-1.5 py-0.2 text-[10px]",
													isActive
														? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
														: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/10 dark:text-white/40",
												)}
											>
												{count}
											</span>
										</button>
									);
								})}
							</div>

							<div className="relative w-full sm:w-64">
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Icon as={Icon} name="search" />
										<Input.Input
											ref={searchInputRef}
											value={searchQuery}
											onChange={(e) => {
												setSearchQuery(e.target.value);
												setCurrentPage(1);
											}}
											placeholder="Filter records..."
										/>
										<span className={cn(kbdClassName, "mr-1")}>/</span>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>

						{/* Table */}
						{paginatedRecords.length === 0 ? (
							<div className="p-8 text-center text-[13px] text-text-sub-600 dark:text-white/50">
								No DNS records match the selected filter.
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-[13px]">
									<thead>
										<tr className="border-b border-stroke-soft-200 bg-bg-weak-50/60 font-mono text-[11px] uppercase tracking-wider text-text-sub-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/40">
											<th className="py-3 pl-4 pr-3">Type</th>
											<th className="py-3 px-3">Name / Host</th>
											<th className="py-3 px-3">Value / Target</th>
											<th className="py-3 px-3">TTL</th>
											<th className="py-3 pr-4 pl-3 text-right">Copy</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-stroke-soft-200 dark:divide-white/5">
										{paginatedRecords.map((record, index) => {
											const copyKey = `record-${index}-${record.type}-${record.value}`;
											return (
												<tr
													key={copyKey}
													className="transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]"
												>
													<td className="py-3 pl-4 pr-3">
														<span
															className={cn(
																"inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold",
																getRecordCapsuleClass(record.type),
															)}
														>
															{record.type}
														</span>
													</td>
													<td className="max-w-[200px] truncate py-3 px-3 font-mono text-[12.5px] text-text-strong-950 dark:text-white">
														{record.name}
													</td>
													<td className="max-w-[420px] py-3 px-3 font-mono text-[12.5px] text-text-strong-950 break-all dark:text-white/90">
														{record.priority !== undefined && (
															<span className="mr-2 inline-flex rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/10 dark:text-white/70">
																Priority: {record.priority}
															</span>
														)}
														<span>{record.value}</span>
													</td>
													<td className="py-3 px-3 font-mono text-[12px] text-text-sub-600 dark:text-white/50">
														{formatTtl(record.ttl)}
													</td>
													<td className="py-3 pr-4 pl-3 text-right">
														<CompactButton.Root
															type="button"
															variant="ghost"
															size="medium"
															onClick={() => handleCopyValue(record.value, copyKey)}
															aria-label="Copy record value"
														>
															<CompactButton.Icon
																as={Icon}
																name={copiedItem === copyKey ? "check" : "copy"}
																className={copiedItem === copyKey ? "text-emerald-500" : ""}
															/>
														</CompactButton.Root>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}

						{/* Footer Pagination */}
						<TableFooter
							total={filteredRecords.length}
							pageRowCount={paginatedRecords.length}
							currentPage={page}
							pageSize={pageSize}
							onPageChange={setCurrentPage}
							onPageSizeChange={setPageSize}
							label="records"
						/>
					</div>
				</div>
			)}
		</div>
	);
}
