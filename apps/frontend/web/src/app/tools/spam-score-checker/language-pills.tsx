"use client";

import { cn } from "@reloop/ui/cn";
import { useEffect, useRef, useState } from "react";
import type { SimpleIcon } from "simple-icons";

export type PillTab = {
	id: string;
	label: string;
	icon: SimpleIcon;
};

type PillBox = {
	width: number;
	height: number;
	left: number;
	top: number;
};

function measureTab(button: HTMLButtonElement | null): PillBox | null {
	if (!button) return null;
	return {
		width: button.offsetWidth,
		height: button.offsetHeight,
		left: button.offsetLeft,
		top: button.offsetTop,
	};
}

export function BrandIcon({
	icon,
	className = "size-3.5",
}: {
	icon: SimpleIcon;
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={cn("fill-current", className)}
			aria-hidden
		>
			<path d={icon.path} />
		</svg>
	);
}

export function LanguagePills({
	tabs,
	activeId,
	onChange,
	ariaLabel,
	idPrefix,
	className,
}: {
	tabs: PillTab[];
	activeId: string;
	onChange: (id: string) => void;
	ariaLabel: string;
	idPrefix: string;
	className?: string;
}) {
	const [mounted, setMounted] = useState(false);
	const [activePill, setActivePill] = useState<PillBox | null>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		const activeIdx = tabs.findIndex((t) => t.id === activeId);
		if (activeIdx >= 0) {
			const button = buttonRefs.current[activeIdx] ?? null;
			const box = measureTab(button);
			setActivePill(box);
		}
	}, [activeId, mounted, tabs]);

	return (
		<div
			role="tablist"
			aria-label={ariaLabel}
			className={cn(
				"relative flex flex-wrap items-center gap-1 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 dark:border-white/10 dark:bg-white/5",
				className,
			)}
		>
			{tabs.map((tab, idx) => {
				const isActive = tab.id === activeId;

				return (
					<button
						key={tab.id}
						ref={(el) => {
							buttonRefs.current[idx] = el;
						}}
						role="tab"
						id={`${idPrefix}-${tab.id}`}
						aria-selected={isActive}
						onClick={() => onChange(tab.id)}
						type="button"
						className={cn(
							"relative z-10 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-[12px] transition-colors",
							isActive
								? "font-medium text-text-strong-950 dark:text-white"
								: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
						)}
					>
						<BrandIcon
							icon={tab.icon}
							className={cn(
								"size-3.5",
								isActive
									? "text-text-strong-950 dark:text-white"
									: "text-text-soft-400 dark:text-white/40",
							)}
						/>
						{tab.label}
					</button>
				);
			})}

			{mounted && activePill && (
				<span
					className="pointer-events-none absolute z-0 rounded-lg bg-bg-weak-50 shadow-xs transition-all duration-200 ease-out dark:bg-white/10"
					style={{
						width: activePill.width,
						height: activePill.height,
						left: activePill.left,
						top: activePill.top,
					}}
				/>
			)}
		</div>
	);
}
