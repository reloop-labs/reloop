import { Icon } from "@reloop/ui/icon";
import { TemplateCardGrid } from "./template-card-grid";

export function TemplatesSection() {
	return (
		<section
			id="templates"
			aria-labelledby="templates-heading"
			className="w-full scroll-mt-24 bg-bg-white-0 dark:bg-black"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-16 text-left sm:px-8 sm:py-20 sm:text-center lg:px-12 dark:border-white/10">
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					<Icon name="layout" className="size-3.5" aria-hidden />
					Templates
				</span>
				<h2
					id="templates-heading"
					className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
				>
					Start from a template
				</h2>
				<p className="mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mx-auto sm:text-base dark:text-white/60">
					Pick a ready-made email and open it on the canvas. Every block stays
					editable, and you can paste your own HTML over it.
				</p>
			</div>
			<div className="px-4 py-10 sm:px-10 sm:py-16 lg:px-12">
				<TemplateCardGrid />
			</div>
		</section>
	);
}
