import type { ReactNode } from "react";

export function ChangelogGridHero({ children }: { children: ReactNode }) {
	return (
		<section className="relative w-full border-stroke-soft-200 border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 pt-28 pb-14 text-left sm:px-10 sm:pt-32 sm:pb-16 md:max-w-7xl lg:px-12 dark:border-white/10">
				{children}
			</div>
		</section>
	);
}

export function ChangelogGridBody({ children }: { children: ReactNode }) {
	return (
		<section className="relative w-full border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{children}
			</div>
		</section>
	);
}
