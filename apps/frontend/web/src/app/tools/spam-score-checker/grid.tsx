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
					<span className="h-3.5 w-0.5 shrink-0 bg-text-strong-950 dark:bg-white" />
					<span className="font-mono text-[10px] text-text-soft-400 uppercase tracking-[0.18em] sm:text-[11px] dark:text-white/30">
						[{" "}
						<span className="text-text-strong-950 dark:text-white">
							{index}
						</span>{" "}
						/ {total} ]<span className="px-2">·</span>
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
						<Icon
							name={eyebrowIcon}
							className="size-3.5 text-text-strong-950 dark:text-white"
						/>
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
						<span className="text-text-strong-950 dark:text-white">
							{accent}
						</span>
					</>
				)}
			</h2>
			{description && (
				<p className="mx-auto mt-5 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/55">
					{description}
				</p>
			)}
		</div>
	);
}

export function CellGrid({
	children,
	cols = 3,
	className,
}: {
	children: React.ReactNode;
	cols?: 2 | 3 | 4;
	className?: string;
}) {
	const colClass = {
		2: "md:grid-cols-2",
		3: "sm:grid-cols-2 lg:grid-cols-3",
		4: "sm:grid-cols-2 lg:grid-cols-4",
	}[cols];

	return (
		<div
			className={cn(
				"grid divide-y md:divide-x md:divide-y-0",
				colClass,
				hairline,
				className,
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
				"flex flex-col justify-between p-6 sm:p-7 md:p-8",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function CellLabel({ tag, icon }: { tag?: string; icon?: string }) {
	return (
		<div className="mb-6 flex items-center justify-between gap-3">
			{tag ? (
				<span className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/50">
					{tag}
				</span>
			) : (
				<span />
			)}
			{icon && (
				<Icon
					name={icon}
					className="size-4 text-text-soft-400 dark:text-white/30"
				/>
			)}
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
		<div>
			<h3 className="font-semibold text-[17px] text-text-strong-950 tracking-tight sm:text-[18px] dark:text-white">
				{title}
			</h3>
			<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
				{description}
			</p>
		</div>
	);
}

export function WindowDots() {
	return (
		<span className="flex items-center gap-1.5" aria-hidden>
			<span className="size-2 rounded-full bg-[#ff5f56]" />
			<span className="size-2 rounded-full bg-[#ffbd2e]" />
			<span className="size-2 rounded-full bg-[#27c93f]" />
		</span>
	);
}
