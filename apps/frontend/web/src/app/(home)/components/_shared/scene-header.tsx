import { Icon, type IconName } from "@reloop/ui/icon";
import Link from "next/link";
import type { ReactNode } from "react";

export interface SceneHeaderProps {
	icon: IconName;
	iconBgColor?: string;
	badge: string;
	title: string;
	description: string;
	ctaLabel?: string;
	ctaHref?: string;
	action?: ReactNode;
}

export function SceneHeader({
	icon,
	iconBgColor = "bg-[#ff6154]",
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
					className={`flex size-5 items-center justify-center rounded-[5px] text-white shadow-xs ${iconBgColor}`}
				>
					<Icon name={icon} className="size-3.5 text-white" aria-hidden />
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
