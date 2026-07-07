import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

type BentoItem = {
	title: string;
	description: string;
	icon: string;
	iconColor: string;
	iconBorder: string;
};

const leftItems: BentoItem[] = [
	{
		title: "Can't debug deliverability",
		description:
			"When delivery drops, you can't see why. Routing and retry logic stay hidden behind a dashboard.",
		icon: "eye-slash-outline",
		iconColor: "text-orange-500 dark:text-orange-400",
		iconBorder: "border-orange-500/25 dark:border-orange-400/30",
	},
	{
		title: "Stuck when you want out",
		description:
			"Your lists, templates, and sender reputation don't travel. Switching vendors takes months.",
		icon: "lock",
		iconColor: "text-red-500 dark:text-red-400",
		iconBorder: "border-red-500/25 dark:border-red-400/30",
	},
];

const centerItem: BentoItem = {
	title: "Run it on your terms",
	description:
		"Deploy on Docker, Kubernetes, or bare metal. Same Apache 2.0 codebase—your network, your rules.",
	icon: "server",
	iconColor: "text-blue-500 dark:text-blue-400",
	iconBorder: "border-blue-500/25 dark:border-blue-400/30",
};

const rightItems: BentoItem[] = [
	{
		title: "Your data, their servers",
		description:
			"Every message and contact passes through infrastructure you don't own or audit.",
		icon: "globe",
		iconColor: "text-amber-500 dark:text-amber-400",
		iconBorder: "border-amber-500/25 dark:border-amber-400/30",
	},
	{
		title: "Read the code",
		description:
			"Apache 2.0. See exactly how emails route, retry, and log. Fork it or ship a PR.",
		icon: "code",
		iconColor: "text-violet-500 dark:text-violet-400",
		iconBorder: "border-violet-500/25 dark:border-violet-400/30",
	},
	{
		title: "One platform, not five",
		description:
			"API, SMTP, webhooks, campaigns, and inboxes—without stitching tools together.",
		icon: "terminal",
		iconColor: "text-primary-base",
		iconBorder: "border-primary-base/25",
	},
];

const hostedItem: BentoItem = {
	title: "We host it too",
	description:
		"No servers to manage. Start on Reloop hosted—3,000 emails/month free, no credit card.",
	icon: "send",
	iconColor: "text-emerald-500 dark:text-emerald-400",
	iconBorder: "border-emerald-500/25 dark:border-emerald-400/30",
};

const proprietaryPoints = [
	"Pricing spikes as you grow",
	"Deliverability you can't debug",
	"Data lives on their servers",
	"Roadmap you can't influence",
];

const reloopPoints = [
	"3,000 emails/month, free",
	"Hosted or self-host—the same code",
	"Every routing decision in source",
	"Ship features on GitHub",
];

function BentoCard({
	item,
	variant = "default",
	className,
}: {
	item: BentoItem;
	variant?: "default" | "tall" | "highlighted" | "wide";
	className?: string;
}) {
	const isTall = variant === "tall" || variant === "highlighted";
	const isWide = variant === "wide";

	return (
		<div
			className={cn(
				"flex flex-col bg-bg-white-0 p-8 transition-colors duration-300 hover:bg-black/[0.01] lg:p-10 dark:bg-transparent dark:hover:bg-white/[0.02]",
				isTall && "h-full justify-between lg:min-h-[280px]",
				isWide &&
					"lg:flex-row lg:items-center lg:justify-between lg:gap-10",
				className,
			)}
		>
			<div className={cn(isWide && "lg:flex lg:items-start lg:gap-6")}>
				<div
					className={cn(
						"inline-flex size-10 shrink-0 items-center justify-center rounded-xl border bg-transparent",
						item.iconBorder,
					)}
				>
					<Icon name={item.icon} className={cn("size-5", item.iconColor)} />
				</div>
				<div className={cn(isWide && "lg:mt-0")}>
					<h3
						className={cn(
							"mt-6 font-semibold text-text-strong-950 leading-snug dark:text-white",
							isWide
								? "text-[15px] sm:text-[17px] lg:mt-0"
								: isTall
									? "text-[18px] sm:text-[20px]"
									: "text-[15px] sm:text-[17px]",
						)}
					>
						{item.title}
					</h3>
					{!isTall && (
						<p
							className={cn(
								"mt-3 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50",
								isWide && "lg:max-w-md",
							)}
						>
							{item.description}
						</p>
					)}
				</div>
			</div>
			{isTall && (
				<p className="mt-8 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50 lg:mt-0">
					{item.description}
				</p>
			)}
			{isWide && (
				<div className="mt-8 flex shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center lg:mt-0">
					<div>
						<p className="font-serif text-[2.4rem] text-text-strong-950 leading-none tracking-tighter dark:text-white">
							$0
						</p>
						<p className="mt-1 text-[13px] text-text-sub-600 dark:text-white/45">
							3,000 emails / month
						</p>
					</div>
					<Link
						href="/dashboard/signup"
						className="group inline-flex h-11 items-center justify-center overflow-hidden rounded-full bg-text-strong-950 px-5 font-medium text-[14px] text-white transition-colors duration-300 hover:bg-text-strong-950/90 dark:bg-white dark:text-[#0a0d12] dark:hover:bg-white/90"
					>
						<span className="inline-flex items-center">
							<span className="group-hover:-translate-x-1 transition-transform duration-300 ease-out">
								Start sending free
							</span>
							<Icon
								name="arrow-left"
								className="ml-0 size-4 max-w-0 shrink-0 translate-x-1 rotate-180 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-4 group-hover:translate-x-0 group-hover:opacity-100"
								aria-hidden
							/>
						</span>
					</Link>
				</div>
			)}
		</div>
	);
}

function ComparisonColumn({
	title,
	items,
	positive,
	highlighted = false,
}: {
	title: string;
	items: string[];
	positive: boolean;
	highlighted?: boolean;
}) {
	return (
		<div className="flex flex-col bg-bg-white-0 p-6 sm:p-7 lg:p-8 dark:bg-transparent">
			<div className="flex items-center gap-2">
				<h3
					className={cn(
						"font-semibold text-[15px] text-text-strong-950 dark:text-white",
						positive && "text-primary-base",
					)}
				>
					{title}
				</h3>
				{highlighted && (
					<span className="shrink-0 rounded-full bg-primary-base px-2 py-0.5 text-center font-semibold text-[10px] text-white uppercase tracking-[0.14em]">
						Recommended
					</span>
				)}
			</div>

			<ul className="mt-6 flex-1 space-y-2.5">
				{items.map((item) => (
					<li
						key={item}
						className="flex items-start gap-3 text-[14px] leading-snug"
					>
						{positive ? (
							<Icon
								name="check-circle"
								className="mt-0.5 size-4 shrink-0 text-text-strong-950 dark:text-white/85"
							/>
						) : (
							<Icon
								name="cross"
								className="mt-0.5 size-4 shrink-0 text-text-sub-600/50 dark:text-white/20"
							/>
						)}
						<span className="text-text-sub-600 dark:text-white/60">{item}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function BentoGrid() {
	return (
		<div className="overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
			<div className="grid gap-px lg:grid-cols-3 lg:grid-rows-3">
				<BentoCard
					item={leftItems[0]}
					className="lg:col-start-1 lg:row-start-1"
				/>
				<BentoCard
					item={leftItems[1]}
					className="lg:col-start-1 lg:row-start-2"
				/>
				<BentoCard
					item={centerItem}
					variant="highlighted"
					className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
				/>
				<BentoCard
					item={rightItems[0]}
					className="lg:col-start-3 lg:row-start-1"
				/>
				<BentoCard
					item={rightItems[1]}
					className="lg:col-start-3 lg:row-start-2"
				/>
				<BentoCard
					item={hostedItem}
					variant="wide"
					className="lg:col-span-2 lg:col-start-1 lg:row-start-3"
				/>
				<BentoCard
					item={rightItems[2]}
					className="lg:col-start-3 lg:row-start-3"
				/>
			</div>
		</div>
	);
}

export function WhyReloopSection() {
	return (
		<>
			<div className="mb-12 text-center lg:mb-16">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Why developers switch
				</p>
				<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
					SendGrid-level email.
					<br />
					<span className="text-primary-base">None of the lock-in.</span>
				</h2>
				<p className="mx-auto mt-4 max-w-lg text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					Open source under Apache 2.0. Use our hosted service or run it
					yourself—same platform either way.
				</p>
			</div>

			<BentoGrid />

			<div className="mt-24">
				<div className="mb-12 text-center lg:mb-16">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						The difference
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						They want your trust.
						<br />
						<span className="text-primary-base">We show you the code.</span>
					</h2>
					<p className="mx-auto mt-4 max-w-lg text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Same features as closed platforms. You can verify every claim yourself.
					</p>
				</div>
				<div className="mx-auto max-w-3xl overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
					<div className="grid gap-px sm:grid-cols-2">
						<ComparisonColumn
							title="Proprietary platforms"
							items={proprietaryPoints}
							positive={false}
						/>
						<ComparisonColumn
							title="Reloop"
							items={reloopPoints}
							positive
							highlighted
						/>
					</div>
				</div>
			</div>
		</>
	);
}
