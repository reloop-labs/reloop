import { cn } from "@reloop/ui/cn";
import type { ComponentType } from "react";
import { SectionHeading } from "../../components/section-heading";

export type GridFeature = {
	icon: ComponentType<{ className?: string }>;
	title: string;
	description: string;
	/** Optional large figure above the title, e.g. a scoring weight. */
	figure?: string;
};

/** Four-up hairline grid used by the temp email checker's feature sections. */
export function FeatureGrid({
	id,
	eyebrow,
	icon,
	title,
	description,
	features,
}: {
	id: string;
	eyebrow: string;
	icon: string;
	title: readonly [string, string];
	description: string;
	features: GridFeature[];
}) {
	return (
		<section id={id} aria-labelledby={`${id}-heading`} className="w-full">
			<SectionHeading
				id={`${id}-heading`}
				eyebrow={eyebrow}
				icon={icon}
				title={title}
				description={description}
			/>
			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{features.map((feature, index) => {
					const IconComponent = feature.icon;
					return (
						<div
							key={feature.title}
							className={cn(
								"flex flex-col border-stroke-soft-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10",
								index < features.length - 1 && "border-b lg:border-b-0",
								index % 2 === 0 && "sm:border-r",
								index === 1 && "lg:border-r",
								index >= 2 && "sm:border-b-0",
							)}
						>
							<div className="flex items-center justify-between">
								<div className="flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-neutral-100 text-neutral-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-neutral-400">
									<IconComponent className="size-5 stroke-[1.75]" />
								</div>
								{feature.figure ? (
									<span className="font-mono font-semibold text-[1.4rem] text-text-strong-950 tracking-tight dark:text-white">
										{feature.figure}
									</span>
								) : null}
							</div>
							<div className="mt-6 flex items-center gap-2">
								<span
									className="h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base"
									aria-hidden
								/>
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									{feature.title}
								</h3>
							</div>
							<p className="mt-3 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
								{feature.description}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
