import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Divider from "@reloop/ui/divider";
import { Icon, type IconName } from "@reloop/ui/icon";
import Link from "next/link";
import type { ReactNode } from "react";

export type SceneColor = "orange" | "blue" | "violet" | "emerald" | "pink";

/** Flat bordered glyph: solid fill, no extrusion, no inset highlight. */
const GLYPH: Record<SceneColor, { face: string }> = {
	orange: {
		face: "bg-[#f97316] dark:bg-[#ea580c]",
	},
	blue: {
		face: "bg-[#2563eb] dark:bg-[#1d4ed8]",
	},
	violet: {
		face: "bg-[#7c3aed] dark:bg-[#6d28d9]",
	},
	emerald: {
		face: "bg-[#059669] dark:bg-[#047857]",
	},
	pink: {
		face: "bg-[#db2777] dark:bg-[#be185d]",
	},
};

export function SceneGlyph({
	icon,
	color,
}: {
	icon: IconName;
	color: SceneColor;
}) {
	const glyph = GLYPH[color];

	return (
		<span
			aria-hidden
			className={cn(
				"inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] border border-stroke-soft-100 text-white dark:border-white/10",
				glyph.face,
			)}
		>
			<Icon name={icon} className="size-3 text-white" />
		</span>
	);
}

export interface SceneHeaderProps {
	icon: IconName;
	color?: SceneColor;
	badge: string;
	title: string;
	description: string;
	ctaLabel?: string;
	ctaHref?: string;
	action?: ReactNode;
	withDivider?: boolean;
	align?: "left" | "center";
	className?: string;
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
	withDivider = true,
	align = "left",
	className,
}: SceneHeaderProps) {
	const isCenter = align === "center";

	return (
		<div className={cn(isCenter && "text-center", className)}>
			<div
				className={cn("flex items-center gap-2", isCenter && "justify-center")}
			>
				<SceneGlyph icon={icon} color={color} />
				<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
					{badge}
				</span>
			</div>

			<h3 className="mt-3.5 font-semibold text-[2rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[2.4rem] lg:text-[2.65rem] dark:text-white">
				{title}
			</h3>

			<p
				className={cn(
					"mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60",
					isCenter && "mx-auto",
				)}
			>
				{description}
			</p>

			{action ? (
				<div className={cn("mt-6", isCenter && "flex justify-center")}>
					{action}
				</div>
			) : ctaLabel ? (
				<div className={cn("mt-6", isCenter && "flex justify-center")}>
					<Button.Root variant="neutral" mode="stroke" size="small" asChild>
						<Link href={ctaHref}>
							{ctaLabel}
							<Icon
								name="arrow-right"
								className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
								aria-hidden="true"
							/>
						</Link>
					</Button.Root>
				</div>
			) : null}

			{withDivider && (
				<Divider.Root className="-mx-4 sm:-mx-8 lg:-mx-12 !w-auto mt-8 dark:before:bg-white/10" />
			)}
		</div>
	);
}
