"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { useState } from "react";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";
import { CompareTitleIcon } from "./compare-title-icon";

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

export type ComparisonCell =
	| string
	| {
			value: string;
			note?: string;
	  };

export interface ComparisonFeatureRow {
	label: string;
	icon?: React.ReactNode | string;
	reloop: ComparisonCell;
	competitor: ComparisonCell;
}

function normalizeCell(cell: ComparisonCell): { value: string; note?: string } {
	if (typeof cell === "string") {
		return { value: cell };
	}
	return cell;
}

function CheckCircleIcon() {
	return (
		<span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="size-3"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
		</span>
	);
}

function CrossCircleIcon() {
	return (
		<span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-400/80 text-white dark:bg-white/20 dark:text-white">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="size-3"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</span>
	);
}

function CellValue({
	cell,
	highlight,
}: {
	cell: ComparisonCell;
	highlight?: boolean;
}) {
	const { value, note } = normalizeCell(cell);
	const normalized = value.toLowerCase();
	const dash = "\u2014";
	const isYes =
		normalized === "yes" ||
		normalized.startsWith("yes ") ||
		normalized.startsWith("yes(") ||
		normalized.startsWith("yes—") ||
		normalized.startsWith("yes-");
	const isNeutralDash = normalized === "—" || normalized === "-";
	const isNo =
		normalized === "no" ||
		normalized.startsWith("no ") ||
		normalized.startsWith("no(") ||
		normalized.startsWith("no—") ||
		normalized.startsWith("no-");

	if (isYes) {
		const label = value === "Yes" ? null : value.replace(/^Yes[\s—-]*/i, "");
		return (
			<div className="flex flex-col items-center justify-center text-center gap-1.5">
				<CheckCircleIcon />
				{label ? (
					<span className="font-medium text-[14px] text-text-strong-950 dark:text-white">
						{label}
					</span>
				) : null}
				{note ? (
					<span className="text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
						{note}
					</span>
				) : null}
			</div>
		);
	}

	if (isNeutralDash) {
		return (
			<div className="flex flex-col items-center justify-center text-center gap-1">
				<span className="text-text-sub-600 dark:text-white/30">—</span>
				{note ? (
					<span className="text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
						{note}
					</span>
				) : null}
			</div>
		);
	}

	if (isNo) {
		const label = value === "No" ? null : value.replace(/^No[\s—-]*/i, "");
		return (
			<div className="flex flex-col items-center justify-center text-center gap-1.5">
				<CrossCircleIcon />
				{label ? (
					<span className="font-medium text-[14px] text-text-strong-950 dark:text-white">
						{label}
					</span>
				) : null}
				{note ? (
					<span className="text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
						{note}
					</span>
				) : null}
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center text-center gap-1">
			<span
				className={
					highlight
						? "font-medium text-primary-base"
						: "font-medium text-[15px] text-text-strong-950 dark:text-white"
				}
			>
				{value}
			</span>
			{note ? (
				<span className="text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
					{note}
				</span>
			) : null}
		</div>
	);
}

export function ComparisonTable({
	competitorName,
	features,
	title = "Compare plans",
	subtitle = "Find the perfect fit",
	reloopSub,
	competitorSub,
}: {
	competitorName: string;
	features: ComparisonFeatureRow[];
	title?: string;
	subtitle?: string;
	reloopSub?: string;
	competitorSub?: string;
}) {
	const [activePlan, setActivePlan] = useState<PlanType>("paid");
	const competitorIcon = competitorBrands.find(
		(brand) => brand.name === competitorName,
	)?.icon;

	const currentPlan = planDetails[activePlan];
	const displayReloopSub = reloopSub ?? currentPlan.reloopSub;
	const displayCompetitorSub = competitorSub ?? currentPlan.competitorSub;

	return (
		<div className="w-full overflow-x-auto sm:overflow-visible pb-2">
			<div className="grid min-w-[560px] grid-cols-[minmax(220px,1.2fr)_minmax(140px,1fr)_minmax(140px,1fr)]">
				{/* Header */}
				<div className="sticky top-16 z-30 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="flex h-full flex-wrap items-center justify-start gap-3 p-4 sm:p-5">
						<h3 className="font-bold text-[16px] text-text-strong-950 tracking-tight sm:text-[17px] dark:text-white">
							{title}
						</h3>
						<PlanTogglePill activePlan={activePlan} onChange={setActivePlan} />
					</div>
				</div>
				<div className="sticky top-16 z-30 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="flex flex-col items-center justify-center gap-1.5 rounded-t-2xl border-x border-t border-stroke-soft-200 bg-bg-weak-50/60 p-5 text-center dark:border-white/10 dark:bg-white/[0.03]">
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
				<div className="sticky top-16 z-30 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
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

				{features.map((row) => {
					const isHeader = !row.reloop && !row.competitor;
					if (isHeader) {
						return (
							<div key={row.label} className="contents">
								<div className="sticky top-[156px] z-20 flex items-center gap-2.5 border-stroke-soft-200 border-b bg-bg-white-0/95 py-3 pr-4 pl-4 sm:pl-6 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
									<CompareTitleIcon title={row.label} icon={row.icon} isSection />
									<span className="font-bold text-[13px] text-text-strong-950 uppercase tracking-wider dark:text-white">
										{row.label}
									</span>
								</div>
								<div className="sticky top-[156px] z-20 border-stroke-soft-200 border-x border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95" />
								<div className="sticky top-[156px] z-20 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95" />
							</div>
						);
					}
					return (
						<div key={row.label} className="contents">
							<div className="flex items-center gap-2.5 border-b border-stroke-soft-200 py-4 pr-4 pl-4 sm:pl-6 dark:border-white/10">
								<CompareTitleIcon title={row.label} icon={row.icon} />
								<span className="font-medium text-[14px] text-text-strong-950 dark:text-white">
									{row.label}
								</span>
							</div>
							<div className="flex items-center justify-center border-x border-b border-stroke-soft-200 bg-bg-weak-50/60 px-4 py-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
								<CellValue cell={row.reloop} />
							</div>
							<div className="flex items-center justify-center border-b border-stroke-soft-200 px-4 py-4 text-center dark:border-white/10">
								<CellValue cell={row.competitor} />
							</div>
						</div>
					);
				})}

				{/* Column footers */}
				<div />
				<div className="h-6 rounded-b-2xl border-x border-b border-stroke-soft-200 bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]" />
				<div />
			</div>
		</div>
	);
}
