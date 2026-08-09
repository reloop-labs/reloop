import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

type UpdateCard = {
	title: string;
	description: string;
	href: string;
	external?: boolean;
	iconName: string;
};

const updateCards: UpdateCard[] = [
	{
		title: "LinkedIn",
		description: "Keep up to date with what the team is building.",
		href: "https://linkedin.com/company/reloop",
		external: true,
		iconName: "linkedin",
	},
	{
		title: "X",
		description: "Stay in the loop with what we're working on.",
		href: "https://x.com/reloop_labs",
		external: true,
		iconName: "twitter",
	},
	{
		title: "Blog",
		description:
			"In-depth engineering guides, tutorials, and product deep dives.",
		href: "/blog",
		external: false,
		iconName: "file-text",
	},
	{
		title: "Changelog",
		description: "Stay on top of all releases and new features.",
		href: "/changelog",
		external: false,
		iconName: "notification-indicator",
	},
];

export function KeepUpToDate() {
	return (
		<section className="w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 py-14 sm:px-10 sm:py-16 md:max-w-7xl lg:px-12 lg:py-20 xl:px-14 dark:border-white/10">
				<div className="text-left">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Keep up to date.
					</h2>
					<p className="mt-1.5 text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Get the latest updates on what we&apos;re building.
					</p>
				</div>

				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4.5 lg:grid-cols-4">
					{updateCards.map((card) => {
						const cardClassName =
							"group flex flex-col justify-between rounded-2xl border border-stroke-soft-200 bg-white p-5 transition-all duration-200 hover:border-stroke-soft-300 hover:bg-bg-weak-50 dark:border-white/10 dark:bg-black dark:hover:border-white/20 dark:hover:bg-white/[0.04]";

						const content = (
							<>
								<div className="flex items-start justify-between">
									<div className="flex items-center justify-start text-text-strong-950 dark:text-white">
										<Icon
											name={card.iconName}
											className="size-3.5 text-text-strong-950 dark:text-white"
										/>
									</div>
									<Icon
										name="arrow-up-right"
										className="group-hover:-translate-y-0.5 size-3.5 text-text-sub-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-white/60"
										aria-hidden="true"
									/>
								</div>
								<div className="mt-4">
									<h3 className="font-semibold text-[13.5px] text-text-strong-950 tracking-tight sm:text-[14px] dark:text-white">
										{card.title}
									</h3>
									<p className="mt-1 text-[12px] text-text-sub-600 leading-relaxed sm:text-[12.5px] dark:text-white/55">
										{card.description}
									</p>
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
