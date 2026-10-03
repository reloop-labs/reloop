import Image from "next/image";
import Link from "next/link";

export function CustomerTestimonial() {
	return (
		<section
			aria-labelledby="testimonial-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			{/* Header Block */}
			<div className="@container grid w-full grid-cols-[auto_1fr_auto] bg-[#ebebeb] lg:grid-cols-[1fr_auto_1fr] dark:bg-[#292929]">
				{/* Left Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="w-full p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>

				{/* Center Content Column */}
				<div className="mx-auto w-full max-w-276 max-w-[1280px] p-[0.5px] lg:min-w-276 lg:min-w-[1280px]">
					<div
						data-slot="content"
						className="h-full rounded bg-card/90 py-16 lg:py-24"
					>
						<div className="mx-auto w-full max-w-5xl px-6 xl:px-0">
							<div className="mx-auto max-w-2xl space-y-6 text-center">
								<h2
									id="testimonial-heading"
									className="text-balance font-semibold text-4xl text-foreground lg:text-5xl"
								>
									Build email templates using a single prompt
								</h2>
								<p className="mb-8 text-balance text-lg text-muted-foreground">
									Describe what you need in plain language and generate
									production-ready emails — then refine every detail in the
									editor.
								</p>
								<Link
									href="/features/email-templates"
									className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent bg-card px-3 font-medium text-xs text-foreground shadow-black/15 shadow-sm ring-1 ring-foreground/10 duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:ring-foreground/15 dark:hover:bg-muted/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
								>
									Explore AI templates
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>
			</div>

			{/* Outer 3-column container matching design system */}
			<div className="@container grid w-full grid-cols-[auto_1fr_auto] bg-[#ebebeb] lg:grid-cols-[1fr_auto_1fr] dark:bg-[#292929]">
				{/* Left Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="w-full p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>

				{/* Center Content Column */}
				<div className="mx-auto w-full max-w-276 max-w-[1280px] p-[0.5px] lg:min-w-276 lg:min-w-[1280px]">
					<div
						data-slot="content"
						className="h-full rounded bg-card"
					>
						{/* Preview panel: same UI as landing PlatformTabs templates tab */}
						<div className="relative h-[560px] w-full overflow-hidden bg-bg-white-0 sm:h-[640px] lg:h-[720px] dark:bg-black">
							{/* Gradient backdrop, templates tint */}
							<div
								aria-hidden
								className="absolute inset-0 bg-gradient-to-b from-[#fbdce5] via-[#fdeef2] to-bg-white-0 dark:from-[#33101c] dark:via-[#160609] dark:to-black"
							/>

							{/* Stable screenshot frame, never remounts */}
							<div className="relative h-full w-full px-10 pt-10">
								<div className="relative h-full w-full overflow-hidden border border-stroke-soft-100 border-b-0 bg-bg-white-0 dark:border-white/10 dark:bg-black">
									<Image
										src="/platform/template.png"
										alt="Templates: React Email blocks that scale"
										fill
										sizes="100vw"
										className="object-cover object-top"
										loading="lazy"
										draggable={false}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>
			</div>
		</section>
	);
}
