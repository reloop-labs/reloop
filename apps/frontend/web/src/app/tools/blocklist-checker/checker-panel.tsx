"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKey } from "@reloop/ui/kbd-key";
import Link from "next/link";
import React, { type FormEvent, useEffect, useRef, useState } from "react";
import {
	type BlocklistCheckResponse,
	type DnsblCheckItemResult,
	runBlocklistCheck,
} from "./check-api";

const PRESETS = [
	{ label: "reloop.sh", value: "reloop.sh" },
	{ label: "getairmail.com", value: "getairmail.com" },
	{ label: "127.0.0.2", value: "127.0.0.2" },
	{ label: "stripe.com", value: "stripe.com" },
	{ label: "gmail.com", value: "gmail.com" },
	{ label: "1.1.1.1", value: "1.1.1.1" },
];

const CATEGORY_LABELS: Record<string, string> = {
	all: "All",
	listed: "Listed",
	clean: "Clean",
	reputation: "Reputation",
	spam: "Spam",
	malware: "Malware",
	open_relay: "Open Relay",
};

const kbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none inline-flex items-center justify-center font-mono font-medium",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white/70",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

export function CheckerPanel() {
	const [input, setInput] = useState("reloop.sh");
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<BlocklistCheckResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const executeCheck = async (targetValue: string) => {
		const target = targetValue.trim();
		if (!target) return;

		setIsLoading(true);
		setError(null);

		try {
			const res = await runBlocklistCheck(target);
			setResult(res);
		} catch (err) {
			setError(
				(err as Error).message ||
					"Failed to scan blocklists. Check your connection.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		executeCheck("reloop.sh");
	}, []);

	// Keyboard shortcut '/' to focus filter search input
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
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		executeCheck(input);
	};

	const handleCopyReport = () => {
		if (!result) return;
		const report = `[Reloop Domain & IP Blocklist Report]\nTarget: ${result.target} (${result.resolvedIp || "N/A"})\nStatus: ${result.isClean ? "Clean across all databases" : `Listed on ${result.listedCount} blocklists`}\nChecked: ${result.totalChecked} DNSBL providers in ${result.scanDurationMs}ms\nTested free at https://reloop.sh/tools/blocklist-checker`;

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
			(activeCategory === "listed" && item.isListed) ||
			(activeCategory === "clean" && !item.isListed) ||
			item.category === activeCategory;

		const matchesSearch =
			!searchQuery ||
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.host.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesCategory && matchesSearch;
	});

	const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
	const paginatedResults = filteredResults.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	useEffect(() => {
		setCurrentPage(1);
	}, [activeCategory, searchQuery, result]);

	return (
		<div className="mx-auto max-w-5xl">
			{/* Input Search Form */}
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#0b0b0b]">
				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
				>
					<div className="relative flex-1">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Enter domain (e.g. yourcompany.com) or IPv4 address (e.g. 198.51.100.1)"
							className="block h-10 w-full rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3.5 font-mono text-[13.5px] text-text-strong-950 outline-none transition-all placeholder:text-text-soft-400 focus:border-text-strong-950 focus:ring-1 focus:ring-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white dark:focus:ring-white dark:placeholder:text-white/30"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading || !input.trim()}
						className="inline-flex h-9.5 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-bg-strong-950 px-4 font-medium text-[13px] text-white shadow-xs transition-colors hover:bg-bg-surface-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
					>
						{isLoading ? (
							<>
								<div className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black" />
								<span>Scanning 50+ Lists...</span>
							</>
						) : (
							<>
								<Icon name="search" className="size-3.5" />
								<span>Check Blocklists</span>
							</>
						)}
					</button>
				</form>

				{/* Presets */}
				<div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-stroke-soft-200/50 pt-3 dark:border-white/10">
					<span className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.12em] dark:text-white/35">
						Try sample:
					</span>
					{PRESETS.map((preset) => (
						<button
							key={preset.value}
							type="button"
							onClick={() => {
								setInput(preset.value);
								executeCheck(preset.value);
							}}
							className={cn(
								"rounded-lg border px-2.5 py-1 font-mono text-[11.5px] transition-colors",
								input === preset.value
									? "border-text-strong-950 bg-bg-weak-50 font-medium text-text-strong-950 dark:border-white dark:bg-white/10 dark:text-white"
									: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-text-strong-950 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white dark:hover:text-white",
							)}
						>
							{preset.label}
						</button>
					))}
				</div>
			</div>

			{/* Error State */}
			{error && (
				<div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-[14px] text-rose-600 dark:border-rose-400/20 dark:text-rose-400">
					<div className="flex items-center gap-2 font-medium">
						<Icon name="alert-triangle" className="size-4.5" />
						<span>Lookup Error</span>
					</div>
					<p className="mt-1 text-[13.5px] leading-relaxed">{error}</p>
				</div>
			)}

			{/* Results Scorecard & Table */}
			{result && !error && (
				<div className="mt-4 space-y-3.5">
					{/* Summary Scorecard */}
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs sm:p-6 dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-start gap-3.5">
								<div
									className={cn(
										"flex size-11 shrink-0 items-center justify-center rounded-2xl",
										result.isClean
											? "bg-success-lighter text-success-base dark:bg-emerald-500/10 dark:text-emerald-400"
											: "bg-error-lighter text-error-base dark:bg-rose-500/10 dark:text-rose-400",
									)}
								>
									<Icon
										name={result.isClean ? "shield-check" : "alert-triangle"}
										className="size-5.5"
									/>
								</div>

								<div>
									<div className="flex items-center gap-2">
										<h2 className="font-semibold text-[17px] text-text-strong-950 tracking-tight sm:text-[19px] dark:text-white">
											{result.isClean
												? "Domain is Clean"
												: "Blocklist Listings Detected"}
										</h2>
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-0.5 font-mono font-semibold text-[11px]",
												result.isClean
													? "bg-success-lighter text-success-base dark:bg-emerald-500/10 dark:text-emerald-400"
													: "bg-error-lighter text-error-base dark:bg-rose-500/10 dark:text-rose-400",
											)}
										>
											{result.listedCount === 0
												? `0 / ${result.totalChecked} Listed`
												: `${result.listedCount} / ${result.totalChecked} Listed`}
										</span>
									</div>

									<p className="mt-1 text-[12.5px] text-text-sub-600 dark:text-white/50">
										Target:{" "}
										<span className="font-medium font-mono text-text-strong-950 dark:text-white">
											{result.target}
										</span>{" "}
										· Resolved IP:{" "}
										<span className="font-medium font-mono text-text-strong-950 dark:text-white">
											{result.resolvedIp || "N/A"}
										</span>{" "}
										· Duration: {result.scanDurationMs}ms
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={handleCopyReport}
									className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 font-medium text-[12px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
								>
									<Icon name={copied ? "check" : "copy"} className="size-3.5" />
									{copied ? "Copied!" : "Copy Report"}
								</button>

								<a
									href="/dashboard/signup"
									className="inline-flex items-center gap-1.5 rounded-xl bg-bg-strong-950 px-3 py-1.5 font-medium text-[12px] text-white transition-colors hover:bg-bg-surface-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
								>
									<span>Send with Reloop</span>
									<Icon name="arrow-right" className="size-3.5" />
								</a>
							</div>
						</div>
					</div>

					{/* Category Filter & Search Bar */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-wrap items-center gap-1.5">
							{["all", "clean", "listed", "reputation", "spam", "malware"].map(
								(cat) => (
									<button
										key={cat}
										type="button"
										onClick={() => setActiveCategory(cat)}
										className={cn(
											"rounded-lg border px-3 py-1.5 text-[12px] transition-colors",
											activeCategory === cat
												? "border-text-strong-950 bg-bg-strong-950 font-medium text-white dark:border-white dark:bg-white dark:text-black"
												: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:text-white",
										)}
									>
										{CATEGORY_LABELS[cat] || cat}
									</button>
								),
							)}
						</div>

						{/* Reloop Dashboard-style Search Filter */}
						<Input.Root size="small" className="w-full sm:w-72 rounded-xl">
							<Input.Wrapper className="h-9">
								<Input.Icon as={Icon} name="search" size="small" />
								<Input.Input
									ref={searchInputRef}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search subject or sender..."
								/>
								<button
									type="button"
									tabIndex={-1}
									aria-label="Focus search"
									onClick={() => searchInputRef.current?.focus()}
									className="shrink-0 cursor-pointer rounded-[5px] outline-none"
								>
									<KbdKey className={kbdClassName}>/</KbdKey>
								</button>
							</Input.Wrapper>
						</Input.Root>
					</div>

					{/* Table of DNSBL Results */}
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="divide-y divide-stroke-soft-200 dark:divide-white/10">
							{paginatedResults.map((item) => (
								<div
									key={item.id}
									className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:px-6"
								>
									<div className="flex items-start gap-3.5 min-w-0">
										<div
											className={cn(
												"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
												item.isListed
													? "bg-error-lighter text-error-base dark:bg-rose-500/10 dark:text-rose-400"
													: "bg-success-lighter text-success-base dark:bg-emerald-500/10 dark:text-emerald-400",
											)}
										>
											<Icon
												name={item.isListed ? "cross-circle" : "check-circle"}
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
													{item.category}
												</span>
											</div>
											<p className="mt-0.5 truncate text-[12.5px] text-text-sub-600 dark:text-white/50">
												{item.description}
											</p>
										</div>
									</div>

									<div className="flex shrink-0 items-center gap-4 self-end sm:self-center">
										<span className="font-mono text-[11px] text-text-soft-400 dark:text-white/35">
											{item.responseTimeMs}ms
										</span>

										{item.isListed ? (
											<a
												href={item.delistUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1 font-medium text-[12.5px] text-error-base underline hover:text-error-base/80 dark:text-rose-400"
											>
												<span>Delist Form</span>
												<Icon name="arrow-up-right" className="size-3" />
											</a>
										) : (
											<span className="inline-flex items-center gap-1 font-mono text-[12px] font-medium text-success-base dark:text-emerald-400">
												Clean
											</span>
										)}
									</div>
								</div>
							))}

							{paginatedResults.length === 0 && (
								<div className="p-8 text-center text-text-soft-400 dark:text-white/40">
									No blocklists match the selected filter.
								</div>
							)}
						</div>

						{/* Table Pagination Footer */}
						{filteredResults.length > 0 && (
							<div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stroke-soft-200 px-4 py-3 text-label-xs text-text-sub-600 sm:px-6 dark:border-white/10 dark:text-white/60">
								<div className="flex items-center gap-3">
									<span>
										Showing {Math.min(filteredResults.length, (currentPage - 1) * pageSize + 1)}–{Math.min(filteredResults.length, currentPage * pageSize)} of {filteredResults.length} blocklists
									</span>
									<div className="flex items-center gap-1.5">
										<select
											value={pageSize}
											onChange={(e) => {
												setPageSize(Number(e.target.value));
												setCurrentPage(1);
											}}
											className="h-7 cursor-pointer rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 font-mono text-label-xs text-text-sub-600 outline-none hover:border-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-white"
										>
											<option value={10}>10</option>
											<option value={20}>20</option>
											<option value={50}>50</option>
										</select>
									</div>
								</div>

								<div className="flex items-center gap-1.5">
									<button
										type="button"
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={currentPage <= 1}
										className="flex size-7 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 cursor-pointer disabled:cursor-not-allowed"
									>
										<Icon name="chevron-left" className="size-3.5" />
									</button>
									<span className="px-2 text-text-sub-600 text-xs dark:text-white/60">
										Page {currentPage} of {totalPages}
									</span>
									<button
										type="button"
										onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
										disabled={currentPage >= totalPages}
										className="flex size-7 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 cursor-pointer disabled:cursor-not-allowed"
									>
										<Icon name="chevron-right" className="size-3.5" />
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
