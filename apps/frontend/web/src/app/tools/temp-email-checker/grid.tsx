import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type React from "react";

export const hairline = "border-stroke-soft-200 dark:border-white/10";

const railWidth = "mx-auto w-full max-w-5xl md:max-w-7xl";

export function Rails({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn(railWidth, "border-x", hairline, className)}>
			{children}
		</div>
	);
}

export function Band({
	children,
	className,
	innerClassName,
	id,
}: {
	children: React.ReactNode;
	className?: string;
	innerClassName?: string;
	id?: string;
}) {
	return (
		<section id={id} className={cn("border-b", hairline, className)}>
			<Rails className={innerClassName}>{children}</Rails>
		</section>
	);
}

export function SectionRule({
	index,
	total,
	label,
}: {
	index: string;
	total: string;
	label: string;
}) {
	return (
		<Band>
			<div className="flex items-stretch">
				<div className="flex flex-1 items-center gap-3 py-4 pl-5 sm:pl-6 md:pl-8">
					<span className="h-3.5 w-0.5 shrink-0 bg-primary-base" />
					<span className="font-mono text-[10px] text-text-soft-400 uppercase tracking-[0.18em] sm:text-[11px] dark:text-white/30">
						[ <span className="text-primary-base">{index}</span> / {total} ]
						<span className="px-2">·</span>
						{label}
					</span>
				</div>
				<div className={cn("hidden flex-1 border-l md:block", hairline)} />
			</div>
		</Band>
	);
}

export function SectionIntro({
	eyebrow,
	eyebrowIcon,
	lead,
	accent,
	description,
}: {
	eyebrow?: string;
	eyebrowIcon?: string;
	lead: string;
	accent?: string;
	description?: string;
}) {
	return (
		<div className="px-5 py-16 text-center sm:px-6 sm:py-20 md:px-8">
			{eyebrow && (
				<p className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
					<span className="text-text-soft-400 dark:text-white/20">{"//"}</span>
					{eyebrowIcon && (
						<Icon name={eyebrowIcon} className="size-3.5 text-primary-base" />
					)}
					{eyebrow}
					<span className="text-text-soft-400 dark:text-white/20">
						{"\\\\"}
					</span>
				</p>
			)}
			<h2 className="mx-auto max-w-3xl font-semibold text-[2rem] text-text-strong-950 leading-[1.08] tracking-[-1px] sm:text-[2.6rem] dark:text-white">
				{lead}
				{accent && (
					<>
						{" "}
						<span className="text-primary-base">{accent}</span>
					</>
				)}
			</h2>
			{description && (
				<p className="mx-auto mt-4 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/50">
					{description}
				</p>
			)}
		</div>
	);
}

/**
 * Cells share hairlines instead of floating as separate cards: the grid gap is
 * one pixel of rule colour showing through from behind.
 */
export function CellGrid({
	columns = 2,
	children,
}: {
	columns?: 2 | 3;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"grid gap-px border-t bg-stroke-soft-200 dark:bg-white/10",
				hairline,
				columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
			)}
		>
			{children}
		</div>
	);
}

export function Cell({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"bg-bg-white-0 px-5 py-8 sm:px-6 md:px-8 md:py-10 dark:bg-black",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function CellLabel({ icon, label }: { icon?: string; label: string }) {
	return (
		<div className="flex items-center gap-2 text-text-soft-400 dark:text-white/35">
			{icon && <Icon name={icon} className="size-[15px] shrink-0" />}
			<span className="font-mono text-[11px] uppercase tracking-[0.14em]">
				{label}
			</span>
		</div>
	);
}

export function CellCopy({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<p className="mt-5 text-[15px] leading-relaxed sm:text-[16px]">
			<span className="font-semibold text-text-strong-950 dark:text-white">
				{title}.
			</span>{" "}
			<span className="text-text-sub-600 dark:text-white/50">
				{description}
			</span>
		</p>
	);
}

export function WindowDots() {
	return (
		<span className="flex shrink-0 items-center gap-1.5">
			<span className="size-2 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
			<span className="size-2 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
			<span className="size-2 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
		</span>
	);
}
