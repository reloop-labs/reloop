import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

type ResourceCard = {
	title: string;
	description: string;
	href: string;
	external?: boolean;
	icon: React.ReactNode;
};

const cards: ResourceCard[] = [
	{
		title: "Quickstart Guide",
		description:
			"Learn how to send your first transactional email with Reloop and your favorite framework.",
		href: "/docs/quickstart",
		external: false,
		icon: (
			<svg
				viewBox="0 0 24 24"
				className="size-5 text-text-strong-950 dark:text-white"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
			</svg>
		),
	},
	{
		title: "Examples",
		description:
			"See example apps, boilerplates, and starters you can build with Reloop SDKs.",
		href: "https://github.com/reloop-labs/reloop",
		external: true,
		icon: (
			<svg
				viewBox="0 0 24 24"
				className="size-5 text-text-strong-950 dark:text-white"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<rect x="3" y="3" width="7" height="7" rx="1.5" />
				<rect x="14" y="3" width="7" height="7" rx="1.5" />
				<rect x="3" y="14" width="7" height="7" rx="1.5" />
				<rect x="14" y="14" width="7" height="7" rx="1.5" />
			</svg>
		),
	},
	{
		title: "API Reference",
		description:
			"Learn about Reloop's REST API, authentication, endpoints, and features.",
		href: "/docs/api",
		external: false,
		icon: (
			<svg
				viewBox="0 0 24 24"
				className="size-5 text-text-strong-950 dark:text-white"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M12 3l4.5 7.5h-9L12 3z" />
				<rect x="4" y="14" width="6.5" height="6.5" rx="1" />
				<circle cx="17" cy="17.25" r="3.25" />
			</svg>
		),
	},
];

export default function FrameworksResources() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 py-14 sm:px-10 sm:py-16 md:max-w-7xl lg:px-12 lg:py-20 xl:px-14 dark:border-white/10">
				<div className="text-left">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						All you need to get started.
					</h2>
					<p className="mt-1.5 text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Explore quickstart guides, working examples, and full API reference.
					</p>
				</div>

				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4.5">
					{cards.map((card) => {
						const cardClassName =
							"group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 transition-all duration-200 hover:border-stroke-soft-300 hover:bg-bg-weak-50 dark:border-white/10 dark:bg-black dark:hover:border-white/20 dark:hover:bg-white/[0.04]";

						const content = (
							<>
								{/* Blueprint watermark pattern */}
								<div
									aria-hidden="true"
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
											{card.icon}
										</div>
										<Icon
											name="arrow-up-right"
											className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-white/50"
											aria-hidden="true"
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
