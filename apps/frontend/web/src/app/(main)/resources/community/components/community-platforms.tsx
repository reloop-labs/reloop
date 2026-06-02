import type { SimpleIcon } from "simple-icons";
import { siDiscord, siGithub, siX } from "simple-icons";

const platforms: {
	title: string;
	description: string;
	href: string;
	label: string;
	icon: SimpleIcon;
	iconClassName: string;
	gridClass: string;
}[] = [
	{
		title: "Discord Community",
		description:
			"Real-time discussions, support, and community events. Get help from the team and fellow developers.",
		href: "https://discord.gg/bHnkBcp7xR",
		label: "Join Discord",
		icon: siDiscord,
		iconClassName: "fill-[#5865F2]",
		gridClass: "col-start-2 row-start-1",
	},
	{
		title: "GitHub Discussions",
		description:
			"Feature requests, technical discussions, and roadmap input. Contribute code and report issues.",
		href: "https://github.com/reloop-labs/reloop/discussions",
		label: "View Discussions",
		icon: siGithub,
		iconClassName: "fill-[#181717] dark:fill-white",
		gridClass: "col-start-1 row-start-2 sm:translate-x-2",
	},
	{
		title: "Twitter / X",
		description:
			"Product updates, tips, and community highlights. Share your Reloop success stories.",
		href: "https://twitter.com/reloophq",
		label: "Follow @reloophq",
		icon: siX,
		iconClassName: "fill-[#0a0a0a] dark:fill-white",
		gridClass: "col-start-3 row-start-2 sm:-translate-x-2",
	},
];

function PlatformIcon({
	icon,
	className,
}: {
	icon: SimpleIcon;
	className?: string;
}) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden>
			<path d={icon.path} />
		</svg>
	);
}

export function CommunityPlatforms() {
	return (
		<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-[#f8f8f8] px-6 py-16 sm:px-10 sm:py-20 lg:py-24 dark:border-white/10 dark:bg-[#0a0a0a]">
			<div className="text-center">
				<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
					Where our community meets
				</h2>
				<p className="mx-auto mt-4 max-w-2xl text-base text-text-sub-600 leading-7 dark:text-white/50">
					Find us across platforms where developers collaborate on email
					infrastructure.
				</p>
			</div>

			<div className="mx-auto mt-16 grid max-w-xs grid-cols-3 grid-rows-2 items-center justify-items-center gap-x-3 gap-y-4 sm:mt-20 sm:max-w-sm sm:gap-x-5 sm:gap-y-6">
				{platforms.map((platform) => (
					<a
						key={platform.title}
						href={platform.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={platform.label}
						className={`group flex flex-col items-center transition-transform duration-300 hover:scale-105 ${platform.gridClass}`}
					>
						<div className="flex size-[4.5rem] items-center justify-center rounded-[18px] border border-stroke-soft-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors duration-300 group-hover:border-stroke-soft-300 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:size-20 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:group-hover:border-white/20 dark:group-hover:bg-white/[0.08]">
							<PlatformIcon
								icon={platform.icon}
								className={`size-8 sm:size-9 ${platform.iconClassName}`}
							/>
						</div>
					</a>
				))}
			</div>

			<div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:mt-20 sm:grid-cols-3 sm:gap-6">
				{platforms.map((platform) => (
					<a
						key={platform.title}
						href={platform.href}
						target="_blank"
						rel="noopener noreferrer"
						className="group flex flex-col text-center sm:text-left"
					>
						<h3 className="font-semibold text-base text-text-strong-950 leading-snug group-hover:text-primary-base dark:text-white">
							{platform.title}
						</h3>
						<p className="mt-2 flex-1 text-sm text-text-sub-600 leading-relaxed dark:text-white/45">
							{platform.description}
						</p>
						<span className="mt-4 inline-flex items-center justify-center gap-1.5 font-semibold text-primary-base text-sm sm:justify-start">
							{platform.label}
							<svg
								viewBox="0 0 24 24"
								className="size-4 transition-transform group-hover:translate-x-0.5"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden
							>
								<path
									d="M5 12h14M13 6l6 6-6 6"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
					</a>
				))}
			</div>
		</div>
	);
}
