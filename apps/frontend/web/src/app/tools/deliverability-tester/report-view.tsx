"use client";

import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type {
	CategoryResult,
	CheckStatus,
	DeliverabilityReport,
} from "./check-api";

interface ReportViewProps {
	report: DeliverabilityReport;
	onReset: () => void;
}

function scoreColor(score: number): {
	text: string;
	bg: string;
	border: string;
	badge: "green" | "orange" | "red";
} {
	if (score >= 8.0) {
		return {
			text: "text-emerald-500 dark:text-emerald-400",
			bg: "bg-emerald-500/10",
			border: "border-emerald-500/20",
			badge: "green",
		};
	}
	if (score >= 5.0) {
		return {
			text: "text-amber-500 dark:text-amber-400",
			bg: "bg-amber-500/10",
			border: "border-amber-500/20",
			badge: "orange",
		};
	}
	return {
		text: "text-rose-500 dark:text-rose-400",
		bg: "bg-rose-500/10",
		border: "border-rose-500/20",
		badge: "red",
	};
}

function statusIcon(status: CheckStatus) {
	if (status === "pass") {
		return (
			<Icon
				name="check-circle"
				className="size-3.5 shrink-0 text-emerald-500"
			/>
		);
	}
	if (status === "warn") {
		return (
			<Icon
				name="alert-triangle"
				className="size-3.5 shrink-0 text-amber-500"
			/>
		);
	}
	if (status === "fail") {
		return (
			<Icon name="cross-circle" className="size-3.5 shrink-0 text-rose-500" />
		);
	}
	return (
		<Icon name="alert-circle" className="size-3.5 shrink-0 text-blue-500" />
	);
}

function categoryIcon(catId: string) {
	switch (catId) {
		case "signature":
			return "shield-check";
		case "blacklists":
			return "alert-triangle";
		case "content":
			return "sparkling";
		case "body":
			return "mail";
		case "links":
			return "link";
		default:
			return "shield";
	}
}

export function ReportView({ report, onReset }: ReportViewProps) {
	const colors = scoreColor(report.score);
	const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(
		{
			signature: true,
			blacklists: report.categories.blacklists.status !== "pass",
			content: report.categories.content.status !== "pass",
			body: report.categories.body.status !== "pass",
			links: report.categories.links.status !== "pass",
		},
	);
	const [showHeaders, setShowHeaders] = useState(false);
	const [headersCopied, setHeadersCopied] = useState(false);

	const toggleAccordion = (catId: string) => {
		setOpenAccordions((prev) => ({
			...prev,
			[catId]: !prev[catId],
		}));
	};

	const handleCopyHeaders = async () => {
		try {
			const formatted = Object.entries(report.headers)
				.map(([k, v]) => `${k}: ${v}`)
				.join("\n");
			await navigator.clipboard.writeText(formatted);
			setHeadersCopied(true);
			setTimeout(() => setHeadersCopied(false), 2000);
		} catch {}
	};

	const categoriesList: CategoryResult[] = [
		report.categories.signature,
		report.categories.blacklists,
		report.categories.content,
		report.categories.body,
		report.categories.links,
	];

	return (
		<div className="space-y-4">
			{/* Top Score Banner */}
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#121212]">
				<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<div className="flex flex-col items-center gap-3.5 sm:flex-row">
						{/* Score circular badge */}
						<div
							className={cn(
								"flex size-16 shrink-0 flex-col items-center justify-center rounded-xl border text-center shadow-inner sm:size-18",
								colors.bg,
								colors.border,
							)}
						>
							<span
								className={cn(
									"font-bold font-mono text-xl leading-none tracking-tight sm:text-2xl",
									colors.text,
								)}
							>
								{report.score.toFixed(1)}
							</span>
							<span className="mt-0.5 font-mono text-[9.5px] text-text-sub-600 dark:text-white/40">
								out of 10
							</span>
						</div>

						<div className="text-center sm:text-left">
							<div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
								<Badge.Root
									variant="lighter"
									color={colors.badge}
									size="medium"
									className="h-5 px-2 font-medium text-[11.5px]"
								>
									<Badge.Dot />
									<span>{report.grade} Grade</span>
								</Badge.Root>
								<Badge.Root
									variant="lighter"
									color={colors.badge}
									size="medium"
									className="h-5 px-2 font-medium text-[11.5px]"
								>
									<Badge.Dot />
									<span>{report.verdictLabel}</span>
								</Badge.Root>
							</div>

							<h2 className="mt-1.5 font-semibold text-[14.5px] text-text-strong-950 tracking-tight sm:text-[15px] dark:text-white">
								{report.subject}
							</h2>
							<p className="mt-0.5 max-w-lg text-[12px] text-text-sub-600 leading-relaxed dark:text-white/55">
								{report.summary}
							</p>
						</div>
					</div>

					<div className="flex w-full flex-col gap-1.5 sm:w-auto">
						<FancyButton.Root
							variant="basic"
							size="xsmall"
							onClick={onReset}
							className="w-full sm:w-auto"
						>
							<FancyButton.Icon
								as={Icon}
								name="refresh-cw"
								className="size-3"
							/>
							<span>Test Another Email</span>
						</FancyButton.Root>
						<FancyButton.Root
							variant="ghost"
							size="xsmall"
							onClick={() => setShowHeaders(!showHeaders)}
							className="w-full text-[11.5px] sm:w-auto"
						>
							<FancyButton.Icon
								as={Icon}
								name={showHeaders ? "eye-slash-outline" : "eye-outline"}
								className="size-3"
							/>
							<span>{showHeaders ? "Hide Headers" : "View Raw Headers"}</span>
						</FancyButton.Root>
					</div>
				</div>

				{/* Metadata Stats Grid */}
				<div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
					<div className="flex items-center gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
						<div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
							<Icon name="mail" className="size-3.5" />
						</div>
						<div className="min-w-0 flex-1">
							<span className="block font-mono text-[9.5px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								From
							</span>
							<p
								className="truncate font-medium font-mono text-[11.5px] text-text-strong-950 dark:text-white"
								title={report.from.address}
							>
								{report.from.address || "Unknown"}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
						<div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
							<Icon name="ip" className="size-3.5" />
						</div>
						<div className="min-w-0 flex-1">
							<span className="block font-mono text-[9.5px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Connecting IP
							</span>
							<p className="truncate font-medium font-mono text-[11.5px] text-text-strong-950 dark:text-white">
								{report.connectingIp || "127.0.0.1"}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
						<div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
							<Icon name="sparkling" className="size-3.5" />
						</div>
						<div className="min-w-0 flex-1">
							<span className="block font-mono text-[9.5px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Rspamd Score
							</span>
							<p className="truncate font-medium font-mono text-[11.5px] text-text-strong-950 dark:text-white">
								{report.categories.content.items[0]?.mark
									? `${report.categories.content.items[0].mark}`
									: "Clean"}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
						<div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
							<Icon name="clock" className="size-3.5" />
						</div>
						<div className="min-w-0 flex-1">
							<span className="block font-mono text-[9.5px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Received At
							</span>
							<p className="truncate font-medium font-mono text-[11.5px] text-text-strong-950 dark:text-white">
								{new Date(report.receivedAt).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit",
								})}
							</p>
						</div>
					</div>
				</div>

				{/* Raw headers inspector */}
				<AnimatePresence>
					{showHeaders && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="mt-3.5 overflow-hidden"
						>
							<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50/70 dark:border-white/10 dark:bg-black/60">
								{/* Header Bar */}
								<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-white-0/80 px-3.5 py-2 dark:border-white/10 dark:bg-white/[0.03]">
									<div className="flex items-center gap-2">
										<span className="font-medium font-mono text-[11.5px] text-text-strong-950 dark:text-white">
											Raw Message Headers
										</span>
										<span className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[10px] text-text-sub-600 dark:bg-white/10 dark:text-white/50">
											{Object.keys(report.headers).length} fields
										</span>
									</div>

									<FancyButton.Root
										variant="basic"
										size="xsmall"
										onClick={handleCopyHeaders}
									>
										<FancyButton.Icon
											as={Icon}
											name={headersCopied ? "check" : "copy"}
											className="size-3"
										/>
										<span className="text-[11px]">
											{headersCopied ? "Copied" : "Copy"}
										</span>
									</FancyButton.Root>
								</div>

								{/* Header Rows */}
								<div className="max-h-64 space-y-1 overflow-y-auto p-3 font-mono text-[11px]">
									{Object.entries(report.headers).map(([k, v]) => (
										<div
											key={k}
											className="flex flex-col gap-0.5 rounded-lg border border-stroke-soft-200/40 bg-bg-white-0/60 p-1.5 sm:flex-row sm:items-start sm:gap-2.5 dark:border-white/5 dark:bg-white/[0.02]"
										>
											<span className="shrink-0 font-medium text-text-sub-600 sm:w-40 dark:text-white/60">
												{k}:
											</span>
											<span className="flex-1 select-all break-all text-text-strong-950 dark:text-white/90">
												{v}
											</span>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Category Accordions */}
			<div className="space-y-2.5">
				{categoriesList.map((category) => {
					const isOpen = openAccordions[category.id] ?? false;
					const iconName = categoryIcon(category.id);
					const hasPenalties = category.mark < 0;

					return (
						<div
							key={category.id}
							className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs transition-colors dark:border-white/10 dark:bg-[#121212]"
						>
							{/* Accordion Header */}
							<button
								type="button"
								onClick={() => toggleAccordion(category.id)}
								className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-bg-weak-50/50 sm:px-4.5 dark:hover:bg-white/[0.02]"
							>
								<div className="flex items-center gap-2.5">
									<div
										className={cn(
											"flex size-7 items-center justify-center rounded-lg border",
											category.status === "pass"
												? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
												: category.status === "warn"
													? "border-amber-500/20 bg-amber-500/10 text-amber-500"
													: "border-rose-500/20 bg-rose-500/10 text-rose-500",
										)}
									>
										<Icon name={iconName} className="size-3.5" />
									</div>

									<div>
										<h3 className="font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
											{category.title}
										</h3>
										<p className="text-[11px] text-text-sub-600 dark:text-white/40">
											{category.items.length} diagnostic checks
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2.5">
									<span
										className={cn(
											"font-mono font-semibold text-[11.5px]",
											hasPenalties
												? "text-rose-500 dark:text-rose-400"
												: "text-emerald-500 dark:text-emerald-400",
										)}
									>
										{hasPenalties
											? `${category.mark.toFixed(1)} pts`
											: "0.0 pts"}
									</span>

									<div
										className={cn(
											"flex size-5 items-center justify-center rounded-full transition-transform duration-200",
											isOpen && "rotate-180",
										)}
									>
										<Icon
											name="chevron-down"
											className="size-3 text-text-sub-600 dark:text-white/40"
										/>
									</div>
								</div>
							</button>

							{/* Accordion Body */}
							<AnimatePresence>
								{isOpen && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.2 }}
									>
										<div className="space-y-2 border-stroke-soft-200 border-t p-3.5 sm:p-4.5 dark:border-white/10">
											{category.items.map((item) => (
												<div
													key={item.id}
													className={cn(
														"rounded-lg border p-3 transition-colors",
														item.status === "pass"
															? "border-emerald-500/20 bg-emerald-500/[0.03] dark:border-emerald-500/10 dark:bg-emerald-500/[0.02]"
															: item.status === "warn"
																? "border-amber-500/20 bg-amber-500/[0.03] dark:border-amber-500/10 dark:bg-amber-500/[0.02]"
																: item.status === "fail"
																	? "border-rose-500/20 bg-rose-500/[0.03] dark:border-rose-500/10 dark:bg-rose-500/[0.02]"
																	: "border-stroke-soft-200 bg-bg-weak-50/50 dark:border-white/10 dark:bg-white/[0.01]",
													)}
												>
													<div className="flex items-start justify-between gap-2.5">
														<div className="flex items-center gap-2">
															{statusIcon(item.status)}
															<span className="font-medium text-[12.5px] text-text-strong-950 dark:text-white">
																{item.title}
															</span>
														</div>

														{item.mark !== 0 && (
															<span
																className={cn(
																	"font-mono font-semibold text-[11px]",
																	item.mark < 0
																		? "text-rose-500 dark:text-rose-400"
																		: "text-emerald-500 dark:text-emerald-400",
																)}
															>
																{item.mark > 0 ? `+${item.mark}` : item.mark}
															</span>
														)}
													</div>

													<p className="mt-0.5 pl-5.5 text-[11.5px] text-text-sub-600 leading-normal dark:text-white/60">
														{item.description}
													</p>

													{item.details && item.details.length > 0 && (
														<ul className="mt-1.5 space-y-0.5 border-black/5 border-t pt-1 pl-5.5 font-mono text-[11px] text-text-sub-600 dark:border-white/5 dark:text-white/40">
															{item.details.map((d) => (
																<li key={d} className="break-all">
																	{d}
																</li>
															))}
														</ul>
													)}

													{item.recommendations &&
														item.recommendations.length > 0 && (
															<div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 pl-3 dark:border-amber-500/10 dark:bg-amber-500/[0.04]">
																<p className="font-semibold text-[11px] text-amber-600 dark:text-amber-400">
																	Recommendation:
																</p>
																<ul className="mt-0.5 space-y-0.5 text-[11px] text-text-sub-600 dark:text-white/60">
																	{item.recommendations.map((r) => (
																		<li key={r}>• {r}</li>
																	))}
																</ul>
															</div>
														)}
												</div>
											))}
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					);
				})}
			</div>
		</div>
	);
}
