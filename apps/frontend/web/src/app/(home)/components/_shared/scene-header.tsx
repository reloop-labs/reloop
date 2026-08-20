import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Divider from "@reloop/ui/divider";
import { Icon, type IconName } from "@reloop/ui/icon";
import Link from "next/link";
import type { ReactNode } from "react";

export type SceneColor = "orange" | "blue" | "violet" | "emerald" | "pink";

/**
 * Physical keycap — same extrusion language as ActionKbd:
 * dark shell as the 1.5px lip, flatter face, hairline inset highlight.
 */
const GLYPH: Record<SceneColor, { shell: string; face: string }> = {
	orange: {
		shell: "bg-[#9a3412] dark:bg-[#7c2d12]",
		face: "bg-[#f97316] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#ea580c] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
	},
	blue: {
		shell: "bg-[#1e3a8a] dark:bg-[#172554]",
		face: "bg-[#2563eb] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#1d4ed8] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
	},
	violet: {
		shell: "bg-[#4c1d95] dark:bg-[#2e1065]",
		face: "bg-[#7c3aed] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#6d28d9] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
	},
	emerald: {
		shell: "bg-[#064e3b] dark:bg-[#022c22]",
		face: "bg-[#059669] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#047857] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
	},
	pink: {
		shell: "bg-[#831843] dark:bg-[#500724]",
		face: "bg-[#db2777] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-[#be185d] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]",
	},
};

export function SceneGlyph({ icon, color }: { icon: IconName; color: SceneColor }) {
	const glyph = GLYPH[color];

	return (
		<span
			aria-hidden
			className={cn(
				"inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] p-px pb-[2px]",
				glyph.shell,
			)}
		>
			<span
				className={cn(
					"flex size-full items-center justify-center rounded-[4px] text-white",
					glyph.face,
				)}
			>
				<Icon name={icon} className="size-3 text-white" />
			</span>
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
}: SceneHeaderProps) {
	return (
		<div>
			<div className="flex items-center gap-2">
				<SceneGlyph icon={icon} color={color} />
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
				<Divider.Root className="mt-8 -mx-4 sm:-mx-8 lg:-mx-12 !w-auto dark:before:bg-white/10" />
			)}
		</div>
	);
}
