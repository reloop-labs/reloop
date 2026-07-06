export function GrosoryPageHeader({ totalLinks }: { totalLinks: number }) {
	return (
		<header className="mx-auto max-w-[920px] border-stroke-soft-200 border-b px-6 pt-36 pb-8 sm:pt-40 dark:border-white/10">
			<h1 className="font-medium text-[1.7rem] text-text-strong-950 leading-[1.2] tracking-[-0.02em] sm:text-[2rem] lg:text-[2.25rem] dark:text-white">
				Grosory — All Reloop Pages
			</h1>
			<p className="mt-2 max-w-[60ch] text-[15px] text-text-sub-600 leading-relaxed dark:text-white/50">
				One page, every destination. {totalLinks} links across tools, use cases,
				integrations, features, and more — kept current so you never have to guess
				where to go on reloop.sh.
			</p>
		</header>
	);
}
