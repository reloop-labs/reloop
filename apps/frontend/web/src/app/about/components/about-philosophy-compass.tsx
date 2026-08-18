import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

const philosophyCards = [
	{
		title: "Why Open Source",
		description:
			"Why we believe email infrastructure must be auditable, self-hostable, and public.",
		href: "/why-open-source",
		iconName: "globe",
	},
	{
		title: "Product Beliefs",
		description:
			"The principles that guide every product decision, interface, and developer experience.",
		href: "/our-product-beliefs",
		iconName: "sparkling",
	},
	{
		title: "Engineering & Local Setup",
		description:
			"Clone, configure, and run Reloop microservices and developer tooling locally.",
		href: "/docs/setup",
		iconName: "command",
	},
];

export function AboutPhilosophyCompass() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 py-14 sm:px-10 sm:py-16 md:max-w-7xl lg:px-12 lg:py-20 xl:px-14 dark:border-white/10">
				<div className="text-left">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Explore our philosophy.
					</h2>
					<p className="mt-1.5 text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Read the foundational thinking behind every architectural and
						product decision at Reloop.
					</p>
				</div>

				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4.5">
					{philosophyCards.map((card) => {
						const cardClassName =
							"group flex flex-col justify-between rounded-2xl border border-stroke-soft-200 bg-white p-5 transition-all duration-200 hover:border-stroke-soft-300 hover:bg-bg-weak-50 dark:border-white/10 dark:bg-black dark:hover:border-white/20 dark:hover:bg-white/[0.04]";

						return (
							<Link key={card.title} href={card.href} className={cardClassName}>
								<div className="flex items-start justify-between">
									<div className="flex items-center justify-start text-text-strong-950 dark:text-white">
										<Icon
											name={card.iconName}
											className="size-4 text-text-strong-950 dark:text-white"
										/>
									</div>
									<Icon
										name="arrow-up-right"
										className="group-hover:-translate-y-0.5 size-3.5 text-text-sub-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-white/60"
										aria-hidden="true"
									/>
								</div>
								<div className="mt-4">
									<h3 className="font-semibold text-[14px] text-text-strong-950 tracking-tight sm:text-[14.5px] dark:text-white">
										{card.title}
									</h3>
									<p className="mt-1 text-[12px] text-text-sub-600 leading-relaxed sm:text-[12.5px] dark:text-white/55">
										{card.description}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
