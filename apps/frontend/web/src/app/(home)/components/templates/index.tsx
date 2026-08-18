export function TemplatesSection() {
	return (
		<article
			id="email-system-templates"
			data-scene="templates"
			className="scroll-mt-28 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-16"
		>
			<h3 className="max-w-xl font-medium text-[1.35rem] text-text-strong-950 leading-snug tracking-tight sm:text-[1.6rem] dark:text-white">
				Templates
			</h3>
			<p className="mt-3 max-w-lg text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/50">
				Build dynamic React email templates with live previews and variable
				interpolation.
			</p>
			<div className="relative mt-8 min-h-[20rem] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:min-h-[24rem] dark:border-white/10 dark:bg-black">
				{/* Templates content will be added here */}
			</div>
		</article>
	);
}
