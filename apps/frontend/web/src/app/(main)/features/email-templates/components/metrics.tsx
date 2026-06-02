"use client";

export default function Metrics() {
	return (
		<section id="metrics">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Built for design teams
					</h2>
					<p className="mx-auto mt-6 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						Professional templates and an editor that keeps marketers and developers in sync.
					</p>
				</div>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-primary-base">50+</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							Pre-built templates
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Newsletters, transactional, and marketing
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-text-strong-950 dark:text-white">
							100%
						</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							Mobile responsive
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Preview across screen sizes
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-primary-base">0</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							HTML required
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Drag-and-drop visual editor
						</div>
					</div>
					<div className="text-center">
						<div className="mb-4 font-bold text-4xl text-text-strong-950 dark:text-white">
							1-click
						</div>
						<div className="font-medium text-text-strong-950 dark:text-white">
							Brand presets
						</div>
						<div className="text-sm text-text-sub-600 dark:text-white/50">
							Apply fonts and colors everywhere
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
