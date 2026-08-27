"use client";

import * as Alert from "@reloop/ui/alert";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as CompactButton from "@reloop/ui/compact-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKey } from "@reloop/ui/kbd-key";
import * as LinkButton from "@reloop/ui/link-button";
import Spinner from "@reloop/ui/spinner";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
	type BlocklistCheckResponse,
	type BlocklistVerdict,
	type DnsblCheckItemResult,
	type ListingStatus,
	runBlocklistCheck,
} from "./check-api";
import { domainBlocklistCount, ipBlocklistCount } from "./content";
import { TableFooter } from "./table-footer";

const PRESETS = [
	{ label: "reloop.sh", value: "reloop.sh" },
	{ label: "getairmail.com", value: "getairmail.com" },
	{ label: "127.0.0.2", value: "127.0.0.2" },
	{ label: "stripe.com", value: "stripe.com" },
	{ label: "gmail.com", value: "gmail.com" },
	{ label: "1.1.1.1", value: "1.1.1.1" },
	{ label: "2001:4860:4860::8888", value: "2001:4860:4860::8888" },
];

const CATEGORY_LABELS: Record<string, string> = {
	all: "All",
	listed: "Listed",
	not_listed: "Not listed",
	error: "Errors",
	spam: "Spam",
	reputation: "Reputation",
	domain: "URI lists",
};

const kbdClassName = cn(
	"inline-flex h-5 items-center justify-center rounded border border-stroke-soft-200 bg-bg-weak-50 px-1 font-mono text-[10px] text-text-sub-600 shadow-xs",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white/70",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

function verdictCopy(
	verdict: BlocklistVerdict,
	listedCount = 0,
): {
	title: string;
	badgeLabel: string;
	icon: "shield-check" | "alert-triangle" | "info-outline";
} {
	if (verdict === "listed") {
		return {
			title:
				listedCount === 1
					? "Listed on 1 Blocklist"
					: `Listed on ${listedCount} Blocklists`,
			badgeLabel: `${listedCount} Listed`,
			icon: "alert-triangle",
		};
	}
	if (verdict === "inconclusive") {
		return {
			title: "Inconclusive — Some Lists Did Not Respond",
			badgeLabel: "Inconclusive",
			icon: "info-outline",
		};
	}
	return {
		title: "Clean — No Blocklist Listings Found",
		badgeLabel: "Clean",
		icon: "shield-check",
	};
}

function formatIpSource(source: string): string {
	if (source === "mx") return "via MX";
	if (source === "spf") return "via SPF";
	if (source === "a") return "via A record";
	return "";
}

function statusLabel(item: DnsblCheckItemResult): string {
	if (item.status === "listed") return "Listed";
	if (item.status === "error") return "Couldn't query";
	if (item.status === "skipped") return "Skipped";
	return "Not listed";
}

function statusTone(status: ListingStatus): string {
	if (status === "listed") {
		return "bg-error-lighter text-error-base dark:bg-rose-500/10 dark:text-rose-400";
	}
	if (status === "error") {
		return "bg-warning-lighter text-warning-base dark:bg-amber-500/10 dark:text-amber-400";
	}
	if (status === "skipped") {
		return "bg-bg-weak-50 text-text-sub-600 dark:bg-white/10 dark:text-white/50";
	}
	return "bg-success-lighter text-success-base dark:bg-emerald-500/10 dark:text-emerald-400";
}

function verdictBadgeColor(
	verdict: BlocklistVerdict,
): "green" | "red" | "orange" | "gray" {
	if (verdict === "clean") return "green";
	if (verdict === "listed") return "red";
	if (verdict === "inconclusive") return "orange";
	return "gray";
}

export function CheckerPanel() {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<BlocklistCheckResponse | null>(null);
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [copied, setCopied] = useState(false);

	const searchInputRef = useRef<HTMLInputElement>(null);
	const abortRef = useRef<AbortController | null>(null);

	const executeCheck = async (targetValue: string) => {
		const target = targetValue.trim();
		if (!target) return;

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setIsLoading(true);
		setError(null);

		try {
			const res = await runBlocklistCheck(target, controller.signal);
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				(err as Error).message ||
					"Failed to query blocklists. Check your connection.",
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
		executeCheck(input);
	};

	const handleCopyReport = () => {
		if (!result) return;
		const ipList =
			result.checkedIps.map((item) => item.ip).join(", ") || "none";
		const report = `[Reloop DNSBL report]
Target: ${result.target}
Verdict: ${result.verdict}
Listed: ${result.listedCount} · Not listed: ${result.cleanCount} · Errors: ${result.errorCount} · Skipped: ${result.skippedCount}
IPs queried: ${ipList}
Duration: ${result.scanDurationMs}ms
This is not a Gmail/Microsoft/Yahoo reputation check.
https://reloop.sh/tools/blocklist-checker`;

		navigator.clipboard.writeText(report).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const filteredResults = (result?.results || []).filter((item) => {
		const matchesCategory =
			activeCategory === "all" ||
			(activeCategory === "listed" && item.status === "listed") ||
			(activeCategory === "not_listed" && item.status === "not_listed") ||
			(activeCategory === "error" && item.status === "error") ||
			item.category === activeCategory ||
			item.listType === activeCategory;

		const matchesSearch =
			!searchQuery ||
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.host.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesCategory && matchesSearch;
	});

	const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
	const page = Math.min(currentPage, totalPages);
	const paginatedResults = filteredResults.slice(
		(page - 1) * pageSize,
		page * pageSize,
	);

	const headline = result
		? verdictCopy(result.verdict, result.listedCount)
		: null;

	return (
		<div className="mx-auto max-w-5xl">
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
								placeholder="Enter an IP address (e.g. 198.51.100.42) or domain (e.g. stripe.com)"
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
								<span>Checking...</span>
							</>
						) : (
							<>
								<Button.Icon as={Icon} name="search" className="size-3.5" />
								<span>Check Blocklists</span>
							</>
						)}
					</Button.Root>
				</form>

				<div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[12px] text-text-sub-600 dark:text-white/45">
					<span className="mr-1 font-mono text-[11px] uppercase tracking-wider">
						Try sample:
					</span>
					{PRESETS.map((preset) => (
						<Button.Root
							key={preset.value}
							type="button"
							variant="neutral"
							mode={input === preset.value ? "filled" : "stroke"}
							size="xxsmall"
							onClick={() => {
								setInput(preset.value);
								executeCheck(preset.value);
							}}
							className="font-mono"
						>
							{preset.label}
						</Button.Root>
					))}
				</div>
			</div>

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

			{!result && !error && !isLoading && (
				<p className="mt-5 text-center text-[13px] text-text-sub-600 dark:text-white/45">
					Enter a sending IP to query {ipBlocklistCount} IP DNS blocklists, or a
					domain name for {domainBlocklistCount} URI lists (not a website scan).
					127.0.0.2 is the RFC 5782 test address and should show as listed.
				</p>
			)}

			{result && !error && (
				<div className="mt-4 space-y-3.5">
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between">
							<div className="flex min-w-0 flex-1 items-start gap-3">
								<div
									className={cn(
										"flex size-9 shrink-0 items-center justify-center rounded-xl",
										result.verdict === "clean"
											? "bg-success-lighter text-success-base dark:bg-emerald-500/10 dark:text-emerald-400"
											: result.verdict === "listed"
												? "bg-error-lighter text-error-base dark:bg-rose-500/10 dark:text-rose-400"
												: "bg-warning-lighter text-warning-base dark:bg-amber-500/10 dark:text-amber-400",
									)}
								>
									<Icon
										name={headline?.icon || "shield-check"}
										className="size-4.5"
									/>
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<h2 className="font-semibold text-sm text-text-strong-950 tracking-tight sm:text-base dark:text-white">
											{headline?.title}
										</h2>
										<Badge.Root
											size="small"
											variant="lighter"
											color={verdictBadgeColor(result.verdict)}
										>
											<Badge.Dot />
											{headline?.badgeLabel}
										</Badge.Root>
									</div>

									<div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-sub-600 dark:text-white/60">
										<span>
											Target:{" "}
											<strong className="font-mono font-semibold text-text-strong-950 dark:text-white">
												{result.target}
											</strong>
										</span>
										{result.checkedIps.length > 0 && (
											<span>
												· Queried IP(s):{" "}
												<strong className="font-mono font-semibold text-text-strong-950 dark:text-white">
													{result.checkedIps
														.map((item) => {
															const src = formatIpSource(item.source);
															return src ? `${item.ip} (${src})` : item.ip;
														})
														.join(", ")}
												</strong>
											</span>
										)}
										<span>
											· Scan Time:{" "}
											<span className="font-mono">
												{result.scanDurationMs}ms
											</span>
										</span>
									</div>

									{result.recommendations[0] && (
										<p className="mt-1.5 text-xs text-text-sub-600 leading-relaxed dark:text-white/70">
											{result.recommendations[0]}
										</p>
									)}

									<p className="mt-1 text-[11px] text-text-soft-400 dark:text-white/35">
										Note: Major mailbox providers (Gmail, Outlook, Yahoo) also
										track internal private sender reputation not published on
										public DNSBLs.
									</p>
								</div>
							</div>

							<div className="flex shrink-0 items-center gap-1.5">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={handleCopyReport}
									className="shrink-0"
								>
									<Button.Icon
										as={Icon}
										name={copied ? "check" : "copy"}
										className="size-3.5"
									/>
									{copied ? "Copied" : "Copy report"}
								</Button.Root>

								<Button.Root
									variant="neutral"
									mode="filled"
									size="xsmall"
									asChild
									className="shrink-0"
								>
									<Link href="/dashboard/signup">
										Send with Reloop
										<Button.Icon as={Icon} name="arrow-right" className="size-3.5" />
									</Link>
								</Button.Root>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-wrap items-center gap-1.5">
							{[
								"all",
								"listed",
								"not_listed",
								"error",
								"domain",
								"spam",
								"reputation",
							].map((cat) => (
								<Button.Root
									key={cat}
									type="button"
									variant="neutral"
									mode={activeCategory === cat ? "filled" : "stroke"}
									size="xxsmall"
									onClick={() => {
										setActiveCategory(cat);
										setCurrentPage(1);
									}}
								>
									{CATEGORY_LABELS[cat] || cat}
								</Button.Root>
							))}
						</div>

						<Input.Root size="small" className="w-full rounded-xl sm:w-72">
							<Input.Wrapper className="h-9">
								<Input.Icon as={Icon} name="search" size="small" />
								<Input.Input
									ref={searchInputRef}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search list name or zone…"
								/>
								<CompactButton.Root
									variant="ghost"
									size="medium"
									type="button"
									tabIndex={-1}
									aria-label="Focus search"
									onClick={() => searchInputRef.current?.focus()}
								>
									<KbdKey className={kbdClassName}>/</KbdKey>
								</CompactButton.Root>
							</Input.Wrapper>
						</Input.Root>
					</div>

					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="divide-y divide-stroke-soft-200 dark:divide-white/10">
							{paginatedResults.map((item) => (
								<div
									key={item.id}
									className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:px-6"
								>
									<div className="flex min-w-0 items-start gap-3.5">
										<div
											className={cn(
												"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
												statusTone(item.status),
											)}
										>
											<Icon
												name={
													item.status === "listed"
														? "cross-circle"
														: item.status === "error"
															? "alert-triangle"
															: item.status === "skipped"
																? "minus"
																: "check-circle"
												}
												className="size-4"
											/>
										</div>

										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<span className="font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
													{item.name}
												</span>
												<code className="font-mono text-[11px] text-text-soft-400 dark:text-white/35">
													{item.host}
												</code>
												<span className="rounded-md bg-bg-weak-50 px-2 py-0.5 font-mono text-[10.5px] text-text-sub-600 uppercase dark:bg-white/10 dark:text-white/60">
													{item.listType === "domain" ? "URI" : "IP"} ·{" "}
													{item.impact}
												</span>
											</div>
											<p className="mt-0.5 truncate text-[12.5px] text-text-sub-600 dark:text-white/50">
												{item.txtRecord || item.error || item.description}
											</p>
										</div>
									</div>

									<div className="flex shrink-0 items-center gap-4 self-end sm:self-center">
										<span className="font-mono text-[11px] text-text-soft-400 dark:text-white/35">
											{item.responseTimeMs}ms
										</span>

										{item.status === "listed" ? (
											<LinkButton.Root
												variant="error"
												size="small"
												asChild
												underline
											>
												<Link
													href={item.delistUrl}
													target="_blank"
													rel="noopener noreferrer"
												>
													Delist Form
													<LinkButton.Icon as={Icon} name="arrow-up-right" />
												</Link>
											</LinkButton.Root>
										) : (
											<span
												className={cn(
													"inline-flex items-center font-medium font-mono text-[12px]",
													item.status === "not_listed"
														? "text-success-base dark:text-emerald-400"
														: item.status === "error"
															? "text-warning-base dark:text-amber-400"
															: "text-text-sub-600 dark:text-white/50",
												)}
											>
												{statusLabel(item)}
											</span>
										)}
									</div>
								</div>
							))}

							{paginatedResults.length === 0 && (
								<div className="p-8 text-center text-text-soft-400 dark:text-white/40">
									No lists match this filter.
								</div>
							)}
						</div>

						<TableFooter
							total={filteredResults.length}
							selectedCount={0}
							pageRowCount={paginatedResults.length}
							currentPage={page}
							pageSize={pageSize}
							onPageChange={(newPage) => setCurrentPage(newPage)}
							onPageSizeChange={(newSize) => {
								setPageSize(newSize);
								setCurrentPage(1);
							}}
							label="row(s)"
						/>
					</div>
				</div>
			)}
		</div>
	);
}
