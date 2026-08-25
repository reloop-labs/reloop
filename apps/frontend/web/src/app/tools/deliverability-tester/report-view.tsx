"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type {
	CategoryResult,
	CheckItem,
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
		return <Icon name="check" className="size-4 text-emerald-500" />;
	}
	if (status === "warn") {
		return <Icon name="alert-triangle" className="size-4 text-amber-500" />;
	}
	if (status === "fail") {
		return <Icon name="x" className="size-4 text-rose-500" />;
	}
	return <Icon name="info-outline" className="size-4 text-blue-500" />;
}

function categoryIcon(catId: string) {
	switch (catId) {
		case "signature":
			return "shield-check";
		case "blacklists":
			return "alert-triangle";
		case "content":
			return "sliders";
		case "body":
			return "align-left";
		case "links":
			return "link-01";
		default:
			return "file-text";
	}
}

export function ReportView({ report, onReset }: ReportViewProps) {
	const colors = scoreColor(report.score);
	const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
		signature: true,
		blacklists: report.categories.blacklists.status !== "pass",
		content: report.categories.content.status !== "pass",
		body: report.categories.body.status !== "pass",
		links: report.categories.links.status !== "pass",
	});
	const [showHeaders, setShowHeaders] = useState(false);

	const toggleAccordion = (catId: string) => {
		setOpenAccordions((prev) => ({
			...prev,
			[catId]: !prev[catId],
		}));
	};

	const categoriesList: CategoryResult[] = [
		report.categories.signature,
		report.categories.blacklists,
		report.categories.content,
		report.categories.body,
		report.categories.links,
	];

	return (
		<div className="space-y-6">
			{/* Top Score Banner */}
			<div className="rounded-3xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#121212]">
				<div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
					<div className="flex flex-col items-center gap-5 sm:flex-row">
						{/* Score circular badge */}
						<div
							className={cn(
								"flex size-24 flex-col items-center justify-center rounded-2xl border text-center shadow-inner sm:size-28",
								colors.bg,
								colors.border,
							)}
						>
							<span className={cn("font-bold font-mono text-3xl sm:text-4xl tracking-tight", colors.text)}>
								{report.score.toFixed(1)}
							</span>
							<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/40">
								out of 10
							</span>
						</div>

						<div className="text-center sm:text-left">
							<div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
								<Badge.Root color={colors.badge} size="medium">
									{report.grade} Grade
								</Badge.Root>
								<Badge.Root color={colors.badge} size="medium">
									{report.verdictLabel}
								</Badge.Root>
							</div>

							<h2 className="mt-2 font-semibold text-lg text-text-strong-950 sm:text-xl dark:text-white">
								{report.subject}
							</h2>
							<p className="mt-1 max-w-xl text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{report.summary}
							</p>
						</div>
					</div>

					<div className="flex w-full flex-col gap-2 sm:w-auto">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="medium"
							onClick={onReset}
							className="w-full sm:w-auto"
						>
							<Icon name="arrow-refresh" className="size-4" />
							Test Another Email
						</Button.Root>
						<Button.Root
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={() => setShowHeaders(!showHeaders)}
							className="text-[13px]"
						>
							{showHeaders ? "Hide Headers" : "View Raw Headers"}
						</Button.Root>
					</div>
				</div>

				{/* Metadata bar */}
				<div className="mt-6 grid grid-cols-2 gap-3 border-t border-stroke-soft-200 pt-5 sm:grid-cols-4 dark:border-white/10">
					<div>
						<span className="text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
							From
						</span>
						<p className="truncate font-mono text-[13px] text-text-strong-950 dark:text-white">
							{report.from.address || "Unknown"}
						</p>
					</div>
					<div>
						<span className="text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
							Connecting IP
						</span>
						<p className="font-mono text-[13px] text-text-strong-950 dark:text-white">
							{report.connectingIp || "127.0.0.1"}
						</p>
					</div>
					<div>
						<span className="text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
							Rspamd Score
						</span>
						<p className="font-mono text-[13px] text-text-strong-950 dark:text-white">
							{report.categories.content.items[0]?.mark ? `${report.categories.content.items[0].mark}` : "Clean"}
						</p>
					</div>
					<div>
						<span className="text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
							Received At
						</span>
						<p className="font-mono text-[13px] text-text-strong-950 dark:text-white">
							{new Date(report.receivedAt).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
							})}
						</p>
					</div>
				</div>

				{/* Raw headers inspector */}
				<AnimatePresence>
					{showHeaders && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="mt-4 overflow-hidden"
						>
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4 font-mono text-[12px] text-text-sub-600 dark:border-white/10 dark:bg-black/50 dark:text-white/60">
								<p className="font-semibold text-text-strong-950 dark:text-white">
									Message Headers:
								</p>
								<div className="mt-2 max-h-60 space-y-1 overflow-y-auto pr-2">
									{Object.entries(report.headers).map(([k, v]) => (
										<div key={k} className="flex gap-2">
											<span className="font-semibold text-text-strong-950 dark:text-white/80">
												{k}:
											</span>
											<span className="break-all">{v}</span>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Category Accordions */}
			<div className="space-y-4">
				{categoriesList.map((category) => {
					const isOpen = openAccordions[category.id] ?? false;
					const iconName = categoryIcon(category.id);
					const hasPenalties = category.mark < 0;

					return (
						<div
							key={category.id}
							className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm transition-colors dark:border-white/10 dark:bg-[#121212]"
						>
							{/* Accordion Header */}
							<button
								type="button"
								onClick={() => toggleAccordion(category.id)}
								className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-bg-weak-50/50 sm:px-6 dark:hover:bg-white/[0.02]"
							>
								<div className="flex items-center gap-3.5">
									<div
										className={cn(
											"flex size-9 items-center justify-center rounded-lg border",
											category.status === "pass"
												? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
												: category.status === "warn"
													? "border-amber-500/20 bg-amber-500/10 text-amber-500"
													: "border-rose-500/20 bg-rose-500/10 text-rose-500",
										)}
									>
										<Icon name={iconName} className="size-4.5" />
									</div>

									<div>
										<h3 className="font-semibold text-[15px] text-text-strong-950 sm:text-base dark:text-white">
											{category.title}
										</h3>
										<p className="text-[12px] text-text-sub-600 dark:text-white/40">
											{category.items.length} diagnostic checks
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<span
										className={cn(
											"font-mono font-semibold text-[13px]",
											hasPenalties
												? "text-rose-500 dark:text-rose-400"
												: "text-emerald-500 dark:text-emerald-400",
										)}
									>
										{hasPenalties ? `${category.mark.toFixed(1)} pts` : "0.0 pts"}
									</span>

									<div
										className={cn(
											"flex size-6 items-center justify-center rounded-full transition-transform duration-200",
											isOpen && "rotate-180",
										)}
									>
										<Icon
											name="chevron-down"
											className="size-4 text-text-sub-600 dark:text-white/40"
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
										<div className="space-y-3 border-t border-stroke-soft-200 p-5 sm:p-6 dark:border-white/10">
											{category.items.map((item) => (
												<div
													key={item.id}
													className={cn(
														"rounded-xl border p-4 transition-colors",
														item.status === "pass"
															? "border-emerald-500/20 bg-emerald-500/[0.03] dark:border-emerald-500/10 dark:bg-emerald-500/[0.02]"
															: item.status === "warn"
																? "border-amber-500/20 bg-amber-500/[0.03] dark:border-amber-500/10 dark:bg-amber-500/[0.02]"
																: item.status === "fail"
																	? "border-rose-500/20 bg-rose-500/[0.03] dark:border-rose-500/10 dark:bg-rose-500/[0.02]"
																	: "border-stroke-soft-200 bg-bg-weak-50/50 dark:border-white/10 dark:bg-white/[0.01]",
													)}
												>
													<div className="flex items-start justify-between gap-3">
														<div className="flex items-center gap-2.5">
															{statusIcon(item.status)}
															<span className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
																{item.title}
															</span>
														</div>

														{item.mark !== 0 && (
															<span
																className={cn(
																	"font-mono font-semibold text-[12px]",
																	item.mark < 0
																		? "text-rose-500 dark:text-rose-400"
																		: "text-emerald-500 dark:text-emerald-400",
																)}
															>
																{item.mark > 0 ? `+${item.mark}` : item.mark}
															</span>
														)}
													</div>

													<p className="mt-1.5 pl-6.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
														{item.description}
													</p>

													{item.details && item.details.length > 0 && (
														<ul className="mt-2.5 space-y-1 border-t border-black/5 pl-6.5 pt-2 font-mono text-[12px] text-text-sub-600 dark:border-white/5 dark:text-white/40">
															{item.details.map((d) => (
																<li key={d} className="break-all">
																	{d}
																</li>
															))}
														</ul>
													)}

													{item.recommendations && item.recommendations.length > 0 && (
														<div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 pl-4 dark:border-amber-500/10 dark:bg-amber-500/[0.04]">
															<p className="font-semibold text-[12px] text-amber-600 dark:text-amber-400">
																Recommendation:
															</p>
															<ul className="mt-1 space-y-1 text-[12px] text-text-sub-600 dark:text-white/60">
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
