import { cn } from "@reloop/ui/cn";
import { Icon, type IconName } from "@reloop/ui/icon";
import Link from "next/link";
import type { ReactNode } from "react";

export type SceneColor = "orange" | "blue" | "violet" | "emerald" | "pink";

const COLOR_STYLES: Record<SceneColor, string> = {
	orange:
		"bg-gradient-to-b from-[#fb923c] to-[#ea580c] border border-[#ea580c]/60 shadow-[0_1.5px_0_0_#9a3412,0_1px_2px_0_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[0_1.5px_0_0_#7c2d12,inset_0_1px_0_0_rgba(255,255,255,0.4)]",
	blue: "bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] border border-[#1d4ed8]/60 shadow-[0_1.5px_0_0_#1e3a8a,0_1px_2px_0_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[0_1.5px_0_0_#172554,inset_0_1px_0_0_rgba(255,255,255,0.4)]",
	violet:
		"bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] border border-[#6d28d9]/60 shadow-[0_1.5px_0_0_#4c1d95,0_1px_2px_0_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[0_1.5px_0_0_#2e1065,inset_0_1px_0_0_rgba(255,255,255,0.4)]",
	emerald:
		"bg-gradient-to-b from-[#10b981] to-[#047857] border border-[#047857]/60 shadow-[0_1.5px_0_0_#064e3b,0_1px_2px_0_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[0_1.5px_0_0_#022c22,inset_0_1px_0_0_rgba(255,255,255,0.4)]",
	pink: "bg-gradient-to-b from-[#ec4899] to-[#be185d] border border-[#be185d]/60 shadow-[0_1.5px_0_0_#831843,0_1px_2px_0_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[0_1.5px_0_0_#500724,inset_0_1px_0_0_rgba(255,255,255,0.4)]",
};

export interface SceneHeaderProps {
	icon: IconName;
	color?: SceneColor;
	badge: string;
	title: string;
	description: string;
	ctaLabel?: string;
	ctaHref?: string;
	action?: ReactNode;
}

export function SceneHeader({
	icon,
	color = "orange",
	badge,
	title,
	description,
	ctaLabel,
	ctaHref = "#",
	action,
}: SceneHeaderProps) {
	return (
		<div>
			<div className="flex items-center gap-2">
				<div
					className={cn(
						"flex size-5 items-center justify-center rounded-[5.5px] text-white",
						COLOR_STYLES[color],
					)}
				>
					<Icon
						name={icon}
						className="size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
						aria-hidden
					/>
				</div>
				<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
					{badge}
				</span>
			</div>

			<h3 className="mt-3.5 font-semibold text-[2rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[2.4rem] lg:text-[2.65rem] dark:text-white">
				{title}
			</h3>

			<p className="mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
				{description}
			</p>

			{action ? (
				<div className="mt-6">{action}</div>
			) : ctaLabel ? (
				<div className="mt-6">
					<Link
						href={ctaHref}
						className="inline-flex items-center justify-center rounded-lg border border-stroke-soft-200 bg-white px-3.5 py-1.5 font-medium text-[13.5px] text-text-strong-950 shadow-xs transition-colors hover:bg-bg-sub-50 dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
					>
						{ctaLabel}
					</Link>
				</div>
			) : null}
		</div>
	);
}
