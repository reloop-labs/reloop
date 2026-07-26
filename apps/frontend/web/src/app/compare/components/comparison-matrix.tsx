"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { useState } from "react";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";
import type { ComparisonCell, ComparisonFeatureRow } from "./comparison-table";

export type ComparisonCategory = {
	id: string;
	label: string;
	intro?: string;
	features: ComparisonFeatureRow[];
};

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

const GRID_COLS =
	"grid-cols-[minmax(220px,1.2fr)_minmax(140px,1fr)_minmax(140px,1fr)]";

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
			<path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
			<path d="M18 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
			<path d="M14 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
			<path d="M10 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
			<path d="M6 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
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
			<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
			<path d="M6 12H4a2 2 0 0 0-2 2v8" />
			<path d="M18 9h2a2 2 0 0 1 2 2v11" />
			<path d="M10 6h4" />
			<path d="M10 10h4" />
			<path d="M10 14h4" />
			<path d="M10 18h4" />
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
		<div className="flex items-center gap-1 rounded-full border border-stroke-soft-200 bg-bg-weak-50/80 p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
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

function MatrixCell({ cell }: { cell: ComparisonCell }) {
	const { value, note } = normalizeCell(cell);
	const normalized = value.toLowerCase();
	const dash = "\u2014";
	const isYes =
		normalized === "yes" ||
		normalized.startsWith("yes ") ||
		normalized.startsWith("yes(") ||
		normalized.startsWith(`yes${dash}`) ||
		normalized.startsWith("yes-");
	const isNo =
		normalized === "no" ||
		normalized === dash ||
		normalized === "-" ||
		normalized.startsWith("no ") ||
		normalized.startsWith("no(") ||
		normalized.startsWith(`no${dash}`) ||
		normalized.startsWith("no-");

	if (isNo) {
		const isDash = value === dash || value === "-";
		const label =
			isDash || value.toLowerCase() === "no"
				? null
				: value.replace(new RegExp(`^No[\\s${dash}-]*`, "i"), "");
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

	if (isYes) {
		const label =
			value === "Yes"
				? null
				: value.replace(new RegExp(`^Yes[\\s${dash}-]*`, "i"), "");
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

	return (
		<div className="flex flex-col items-center justify-center text-center gap-1">
			<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
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

export function ComparisonMatrix({
	competitorName,
	categories,
	title = "Compare plans",
	subtitle = "Find the perfect fit",
	reloopSub,
	competitorSub,
}: {
	competitorName: string;
	categories: ComparisonCategory[];
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
			<div className={cn("grid min-w-[560px]", GRID_COLS)}>
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

				{categories.map((section) => (
					<div key={section.id} className="contents">
						<div className="sticky top-[156px] z-20 flex items-center border-stroke-soft-200 border-b bg-bg-white-0/95 py-3 pr-4 pl-4 sm:pl-6 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
							<span className="font-bold text-[13px] text-text-strong-950 uppercase tracking-wider dark:text-white">
								{section.label}
							</span>
						</div>
						<div className="sticky top-[156px] z-20 border-stroke-soft-200 border-x border-b bg-bg-weak-50/95 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]" />
						<div className="sticky top-[156px] z-20 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95" />

						{section.features.map((row) => (
							<div key={`${section.id}-${row.label}`} className="contents">
								<div className="flex items-center border-stroke-soft-200 border-b py-4 pr-4 pl-4 sm:pl-6 dark:border-white/10">
									<span className="text-[14px] text-text-sub-600 dark:text-white/50">
										{row.label}
									</span>
								</div>
								<div className="flex items-center justify-center border-stroke-soft-200 border-x border-b bg-bg-weak-50/60 px-4 py-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
									<MatrixCell cell={row.reloop} />
								</div>
								<div className="flex items-center justify-center border-stroke-soft-200 border-b px-4 py-4 text-center dark:border-white/10">
									<MatrixCell cell={row.competitor} />
								</div>
							</div>
						))}
					</div>
				))}

				{/* Column footers */}
				<div />
				<div className="h-6 rounded-b-2xl border-stroke-soft-200 border-x border-b bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]" />
				<div />
			</div>
		</div>
	);
}
