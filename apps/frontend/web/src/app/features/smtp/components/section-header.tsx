import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";

/** Eyebrow, heading and lede shared by every SMTP page section. */
export function SectionHeader({
	id,
	icon,
	eyebrow,
	title,
	description,
}: {
	id: string;
	icon: string;
	eyebrow: string;
	title: ReactNode;
	description: ReactNode;
}) {
	return (
		<div className="border-stroke-soft-100 border-b px-4 py-16 text-left sm:px-8 sm:py-20 sm:text-center lg:px-12 dark:border-white/10">
			<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
				<Icon name={icon} className="size-3.5" aria-hidden />
				{eyebrow}
			</span>
			<h2
				id={id}
				className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
			>
				{title}
			</h2>
			<p className="mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mx-auto sm:text-base dark:text-white/60">
				{description}
			</p>
		</div>
	);
}
