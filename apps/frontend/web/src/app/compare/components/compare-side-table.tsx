"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import type React from "react";
import { useState } from "react";
import Link from "next/link";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

export type PlanType = "free" | "startup" | "paid";

const planDetails: Record<
	PlanType,
	{ reloopSub: string; reloopHref: string; competitorSub: string }
> = {
	free: {
		reloopSub: "FREE ↗",
		reloopHref: "/pricing",
		competitorSub: "FREE TIER",
	},
	startup: {
		reloopSub: "STARTUP ↗",
		reloopHref: "/pricing",
		competitorSub: "GROWTH / PRO",
	},
	paid: {
		reloopSub: "PRO / ENTERPRISE ↗",
		reloopHref: "/pricing#pro",
		competitorSub: "ENTERPRISE",
	},
};

function UserIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	);
}

function StoreIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
			<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
			<path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
			<path d="M2 7h20" />
		</svg>
	);
}

function BuildingIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
			<path d="M9 22v-4h6v4" />
			<path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M8 10h.01M8 14h.01M16 10h.01M16 14h.01" />
		</svg>
	);
}

function PlanTogglePill({
	activePlan,
	onChange,
}: {
	activePlan: PlanType;
	onChange: (plan: PlanType) => void;
}) {
	return (
		<div className="inline-flex items-center gap-0.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50/80 p-1 dark:border-white/10 dark:bg-white/[0.04]">
			<button
				type="button"
				onClick={() => onChange("free")}
				className={cn(
					"flex size-7 items-center justify-center rounded-full transition-all duration-200",
					activePlan === "free"
						? "bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black"
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
				)}
				title="Free plan"
				aria-label="Free plan"
			>
				<UserIcon className="size-3.5" />
			</button>
			<button
				type="button"
				onClick={() => onChange("startup")}
				className={cn(
					"flex size-7 items-center justify-center rounded-full transition-all duration-200",
					activePlan === "startup"
						? "bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black"
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
				)}
				title="Startup plan"
				aria-label="Startup plan"
			>
				<StoreIcon className="size-3.5" />
			</button>
			<button
				type="button"
				onClick={() => onChange("paid")}
				className={cn(
					"flex size-7 items-center justify-center rounded-full transition-all duration-200",
					activePlan === "paid"
						? "bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black"
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
				)}
				title="Paid plan"
				aria-label="Paid plan"
			>
				<BuildingIcon className="size-3.5" />
			</button>
		</div>
	);
}

export type CompareSideTableRow = {
	label: string;
	reloop: React.ReactNode;
	competitor: React.ReactNode;
};

/**
 * Shared 3-column comparison table with Reloop column highlight.
 * Used for webhooks, pricing, and other deep-dive side-by-sides.
 */
export function CompareSideTable({
	title = "Compare plans",
	subtitle = "Find the perfect fit",
	competitorName,
	competitorIcon,
	rows,
	reloopSub,
	competitorSub,
}: {
	title?: string;
	subtitle?: string;
	competitorName: string;
	competitorIcon?: Pick<SimpleIcon, "hex" | "path">;
	rows: CompareSideTableRow[];
	reloopSub?: string;
	competitorSub?: string;
}) {
	const [activePlan, setActivePlan] = useState<PlanType>("paid");
	const currentPlan = planDetails[activePlan];
	const displayReloopSub = reloopSub ?? currentPlan.reloopSub;
	const displayCompetitorSub = competitorSub ?? currentPlan.competitorSub;

	return (
		<div className="mx-auto w-full max-w-[1100px]">
			<div className="grid w-full items-stretch grid-cols-1 sm:grid-cols-[36px_1fr_36px]">
				{/* Left side hatch gutter */}
				<div
					aria-hidden
					className="hidden min-h-full border-stroke-soft-200 border-r border-dashed text-text-strong-950/15 sm:block dark:border-white/15 dark:text-white/15"
					style={{
						backgroundImage:
							"repeating-linear-gradient(-45deg, transparent 0, transparent 5px, currentColor 5px, currentColor 6.5px)",
					}}
				/>

				<div className="w-full min-w-0 overflow-x-auto sm:overflow-visible pb-2">
					<div className="grid min-w-[500px] grid-cols-[1fr_minmax(200px,300px)_minmax(200px,300px)]">
						{/* Header */}
						<div className="sticky top-16 z-30 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<div className="flex h-full flex-wrap items-center justify-start gap-3 p-4 sm:p-5">
								<h3 className="font-bold text-[16px] text-text-strong-950 tracking-tight sm:text-[17px] dark:text-white">
									{title}
								</h3>
								<PlanTogglePill activePlan={activePlan} onChange={setActivePlan} />
							</div>
						</div>
						<div className="sticky top-16 z-30 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<div className="flex flex-col items-center justify-center gap-1.5 rounded-t-2xl border-stroke-soft-200 border-x border-t bg-bg-weak-50/60 p-5 text-center dark:border-white/10 dark:bg-white/[0.03]">
								<div className="flex items-center justify-center gap-2">
									<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
										<Logo className="size-full text-text-strong-950" />
									</span>
									<span className="font-bold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
										Reloop
									</span>
								</div>
								<Link
									href={currentPlan.reloopHref}
									className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
								>
									{displayReloopSub}
								</Link>
							</div>
						</div>
						<div className="sticky top-16 z-30 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<div className="flex flex-col items-center justify-center gap-1.5 p-5 text-center">
								<div className="flex items-center justify-center gap-2">
									{competitorIcon ? (
										<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
											<BrandIcon icon={competitorIcon} className="size-4" />
										</span>
									) : null}
									<span className="font-bold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
										{competitorName}
									</span>
								</div>
								<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
									{displayCompetitorSub}
								</span>
							</div>
						</div>

						{/* Rows */}
						{rows.map((row) => (
							<div key={row.label} className="contents">
								<div className="flex items-center border-stroke-soft-200 border-b py-4 pr-4 pl-4 sm:pl-6 dark:border-white/10">
									<span className="text-[14px] text-text-sub-600 dark:text-white/50">
										{row.label}
									</span>
								</div>
								<div className="flex items-center justify-center border-stroke-soft-200 border-x border-b bg-bg-weak-50/60 px-4 py-4 text-center font-medium text-[15px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
									{row.reloop}
								</div>
								<div className="flex items-center justify-center border-stroke-soft-200 border-b px-4 py-4 text-center font-medium text-[15px] text-text-strong-950 dark:border-white/10 dark:text-white">
									{row.competitor}
								</div>
							</div>
						))}

						{/* Column footers */}
						<div />
						<div className="h-6 rounded-b-2xl border-stroke-soft-200 border-x border-b bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]" />
						<div />
					</div>
				</div>

				{/* Right side hatch gutter */}
				<div
					aria-hidden
					className="hidden min-h-full border-stroke-soft-200 border-l border-dashed text-text-strong-950/15 sm:block dark:border-white/15 dark:text-white/15"
					style={{
						backgroundImage:
							"repeating-linear-gradient(-45deg, transparent 0, transparent 5px, currentColor 5px, currentColor 6.5px)",
					}}
				/>
			</div>
		</div>
	);
}
