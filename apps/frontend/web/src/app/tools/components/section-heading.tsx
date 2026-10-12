import { Icon } from "@reloop/ui/icon";

/**
 * Centered section header matching the transactional email page. The title
 * is two lines from `sm` up; on phones it wraps naturally.
 */
export function SectionHeading({
	id,
	eyebrow,
	icon,
	title,
	description,
}: {
	id: string;
	eyebrow: string;
	icon?: string;
	title: readonly [string, string];
	description?: string;
}) {
	return (
		<div className="border-stroke-soft-100 border-b px-4 py-16 text-left sm:px-8 sm:py-20 sm:text-center lg:px-12 dark:border-white/10">
			<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
				{icon ? <Icon name={icon} className="size-3.5" aria-hidden /> : null}
				{eyebrow}
			</span>
			<h2
				id={id}
				className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
			>
				{title[0]} <br className="hidden sm:block" />
				{title[1]}
			</h2>
			{description ? (
				<p className="mt-3 max-w-xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mx-auto sm:text-base dark:text-white/60">
					{description}
				</p>
			) : null}
		</div>
	);
}
