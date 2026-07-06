export const grosoryContentClass = "mx-auto max-w-[920px] px-6";

export function GrosoryPageHeader({ description }: { description: string }) {
	return (
		<header className={`${grosoryContentClass} border-stroke-soft-200 border-b pt-36 pb-8 sm:pt-40 dark:border-white/10`}>
			<h1 className="font-serif text-[2.75rem] text-text-strong-950 leading-tight tracking-tight sm:text-[3.25rem] lg:text-[3.75rem] dark:text-white">
				Grosory
			</h1>
			<p className="mt-3 max-w-[60ch] text-[15px] text-text-sub-600 leading-relaxed dark:text-white/50">
				{description}
			</p>
		</header>
	);
}
