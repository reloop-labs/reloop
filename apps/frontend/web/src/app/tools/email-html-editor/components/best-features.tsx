import { cn } from "@reloop/ui/cn";
import { Code, LayoutTemplate, Lock, MousePointerClick } from "lucide-react";
import type { ComponentType } from "react";
import { SectionHeading } from "../../components/section-heading";

type FeatureItem = {
	icon: ComponentType<{ className?: string }>;
	title: string;
	description: string;
};

const FEATURES: FeatureItem[] = [
	{
		icon: LayoutTemplate,
		title: "Start from a template",
		description:
			"Open a ready-made email on the canvas. Columns, images, and buttons stay editable blocks, and you can paste your own HTML over it.",
	},
	{
		icon: MousePointerClick,
		title: "Inspect the same tree",
		description:
			"Select a heading, cell, or button. Padding, color, and type edit the live document, then source updates to match.",
	},
	{
		icon: Code,
		title: "Source stays in sync",
		description:
			"Flip to code. Canvas typing and inspect writes compose back into the HTML. Edit source and the canvas updates.",
	},
	{
		icon: Lock,
		title: "No account to start",
		description:
			"Edit freely in this tab. When you're happy, save it to Reloop Templates with a free account.",
	},
];

export function BestFeatures() {
	return (
		<section
			id="best-features"
			aria-labelledby="best-features-heading"
			className="w-full"
		>
			<SectionHeading
				id="best-features-heading"
				eyebrow="Best features"
				icon="star"
				title={["Why choose Reloop's", "email HTML editor"]}
				description="A visual canvas and the HTML source, kept in sync as you edit. Free to use in your browser, with nothing to install."
			/>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{FEATURES.map((feature, index) => {
					const borderClass =
						index === 0
							? "border-b sm:border-r lg:border-b-0 lg:border-r"
							: index === 1
								? "border-b sm:border-r-0 lg:border-b-0 lg:border-r"
								: index === 2
									? "border-b sm:border-b-0 sm:border-r lg:border-b-0 lg:border-r"
									: "border-b-0 sm:border-b-0 sm:border-r-0 lg:border-r-0";

					const IconComponent = feature.icon;

					return (
						<div
							key={feature.title}
							className={cn(
								"flex flex-col border-stroke-soft-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10",
								borderClass,
							)}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-neutral-100 text-neutral-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-neutral-400">
								<IconComponent className="h-5 w-5 stroke-[1.75]" />
							</div>

							<div className="mt-6 flex items-center gap-2">
								<span
									className="h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base"
									aria-hidden="true"
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
