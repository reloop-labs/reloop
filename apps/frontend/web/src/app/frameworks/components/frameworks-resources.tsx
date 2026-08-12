import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

type ResourceCard = {
	title: string;
	description: string;
	href: string;
	iconName: string;
	external?: boolean;
};

const cards: ResourceCard[] = [
	{
		title: "Quickstart Guide",
		description:
			"Learn how to send your first email with Reloop and your favorite framework in minutes.",
		href: "/docs/quickstart",
		iconName: "zap",
	},
	{
		title: "Examples",
		description:
			"Explore production-ready examples, starter templates, and sample apps for popular web frameworks.",
		href: "https://github.com/reloop-labs/reloop",
		iconName: "brackets",
		external: true,
	},
	{
		title: "API Reference",
		description:
			"Detailed documentation for every REST endpoint, header, request body, and response payload.",
		href: "/docs/api",
		iconName: "api",
	},
];

export default function FrameworksResources() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Section Header */}
				<div className="flex flex-col items-start gap-3 border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10">
					<div className="flex items-center gap-2.5">
						<Icon
							name="book-open"
							className="size-5 shrink-0 text-text-strong-950 dark:text-white"
							aria-hidden
						/>
						<span className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/50">
							Resources
						</span>
					</div>
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						All you need to get started.
					</h2>
					<p className="max-w-xl text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
						Guides, open-source repositories, and complete API references to
						help you build and scale transactional emails.
					</p>
				</div>

				{/* 3 Resource Cards */}
				<div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 sm:gap-4.5 sm:p-10 lg:p-12">
					{cards.map((card) => {
						const cardClassName =
							"group relative flex flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 transition-all duration-200 hover:border-stroke-soft-300 hover:bg-bg-weak-50 dark:border-white/10 dark:bg-black dark:hover:border-white/20 dark:hover:bg-white/[0.04]";

						const content = (
							<>
								{/* Subtle diagonal hatch background */}
								<div
									aria-hidden
									className="pointer-events-none absolute inset-0 text-stroke-soft-200/70 dark:text-white/[0.06]"
									style={{
										backgroundImage:
											"repeating-linear-gradient(-45deg, transparent 0, transparent 10px, currentColor 10px, currentColor 10.75px)",
										maskImage:
											"linear-gradient(to bottom right, black 0%, transparent 70%)",
										WebkitMaskImage:
											"linear-gradient(to bottom right, black 0%, transparent 70%)",
									}}
								/>

								<div className="relative z-10 flex flex-col gap-4">
									<div className="flex items-start justify-between">
										<div className="flex size-9 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
											<Icon name={card.iconName} className="size-4" />
										</div>
										<Icon
											name="arrow-up-right"
											className="group-hover:-translate-y-0.5 size-3.5 text-text-sub-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-white/50"
											aria-hidden
										/>
									</div>
									<div>
										<h3 className="font-semibold text-[14.5px] text-text-strong-950 tracking-tight sm:text-[15px] dark:text-white">
											{card.title}
										</h3>
										<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
											{card.description}
										</p>
									</div>
								</div>
							</>
						);

						if (card.external) {
							return (
								<a
									key={card.title}
									href={card.href}
									target="_blank"
									rel="noopener noreferrer"
									className={cardClassName}
								>
									{content}
								</a>
							);
						}

						return (
							<Link key={card.title} href={card.href} className={cardClassName}>
								{content}
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
