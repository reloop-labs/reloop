import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { contactEmail } from "@reloop/web/lib/site";
import Link from "next/link";

type EntityCard = {
	title: string;
	subtitle: string;
	description: string;
	points: string[];
	highlighted?: boolean;
};

type RoleItem = {
	title: string;
	description: string;
	icon: string;
	iconColor: string;
	iconBorder: string;
};

type TimelineItem = {
	year: string;
	title: string;
	description: string;
};

type ExploreLink = {
	title: string;
	description: string;
	href: string;
	external?: boolean;
};

const entities: EntityCard[] = [
	{
		title: "Reloop",
		subtitle: "The platform",
		description:
			"Open-source email infrastructure under Apache 2.0. The codebase, APIs, and docs.",
		points: [
			"Transactional email, campaigns, SMTP, webhooks",
			"Self-host on your infrastructure",
			"Fork, audit, and contribute on GitHub",
		],
	},
	{
		title: "Reloop Labs",
		subtitle: "The company",
		description:
			"The team that builds, maintains, and operates Reloop—the product and the hosted service.",
		points: [
			"Maintains the open-source codebase",
			"Runs the hosted service at reloop.sh",
			"Ships in public with the community",
		],
		highlighted: true,
	},
];

const roles: RoleItem[] = [
	{
		title: "Maintain the codebase",
		description:
			"We write, review, and release Reloop as open source—same code whether you host it or we do.",
		icon: "code",
		iconColor: "text-violet-500 dark:text-violet-400",
		iconBorder: "border-violet-500/25 dark:border-violet-400/30",
	},
	{
		title: "Run the hosted service",
		description:
			"Reloop Labs operates reloop.sh so teams can use Reloop without managing their own infrastructure.",
		icon: "server",
		iconColor: "text-blue-500 dark:text-blue-400",
		iconBorder: "border-blue-500/25 dark:border-blue-400/30",
	},
	{
		title: "Support the community",
		description:
			"Discord, GitHub issues, docs, and a public roadmap—so you always know where the project is headed.",
		icon: "users",
		iconColor: "text-emerald-500 dark:text-emerald-400",
		iconBorder: "border-emerald-500/25 dark:border-emerald-400/30",
	},
];

const timeline: TimelineItem[] = [
	{
		year: "Sep 2025",
		title: "Reloop Labs founded",
		description:
			"Started building open-source email infrastructure after one too many opaque vendor contracts.",
	},
	{
		year: "2025–2026",
		title: "Building in public",
		description:
			"Shipped APIs, self-hosting, agent inboxes, and deliverability tooling on GitHub and Discord.",
	},
	{
		year: "Jul 2026",
		title: "Public launch",
		description:
			"Reloop goes live—hosted service and self-host from day one, same Apache 2.0 codebase.",
	},
	{
		year: "Now",
		title: "Early and shipping",
		description:
			"A small team, a public roadmap, and weekly improvements. We're just getting started.",
	},
];

const exploreLinks: ExploreLink[] = [
	{
		title: "Why Reloop",
		description: "The problem we set out to solve.",
		href: "/philosophy/why-reloop",
	},
	{
		title: "What we stand for",
		description: "The principles behind every decision.",
		href: "/philosophy/what-we-stand-for",
	},
	{
		title: "Why open source",
		description: "Why the codebase is public.",
		href: "/philosophy/why-open-source",
	},
	{
		title: "Contact us",
		description: "Email, Discord, or GitHub.",
		href: "/company/contact-us",
	},
];

function EntityColumn({ entity }: { entity: EntityCard }) {
	return (
		<div
			className={cn(
				"flex flex-col bg-bg-white-0 p-8 lg:p-10",
				entity.highlighted && "lg:min-h-[360px]",
			)}
		>
			<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/40">
				{entity.subtitle}
			</p>
			<h3
				className={cn(
					"mt-3 font-semibold text-[18px] leading-snug sm:text-[20px]",
					entity.highlighted
						? "text-primary-base"
						: "text-text-strong-950 dark:text-white",
				)}
			>
				{entity.title}
			</h3>
			<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
				{entity.description}
			</p>
			<ul className="mt-8 flex-1 space-y-2.5">
				{entity.points.map((point) => (
					<li
						key={point}
						className="flex items-start gap-3 text-[14px] leading-snug"
					>
						<Icon
							name="check-circle"
							className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/35"
						/>
						<span className="text-text-sub-600 dark:text-white/60">{point}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function RoleCard({ item }: { item: RoleItem }) {
	return (
		<div className="flex flex-col bg-bg-white-0 p-8 transition-colors duration-300 hover:bg-neutral-950/[0.004] lg:p-10 dark:bg-transparent dark:hover:bg-white/[0.012]">
			<div
				className={cn(
					"inline-flex size-10 items-center justify-center rounded-xl border bg-transparent",
					item.iconBorder,
				)}
			>
				<Icon name={item.icon} className={cn("size-5", item.iconColor)} />
			</div>
			<h3 className="mt-6 font-semibold text-[15px] text-text-strong-950 leading-snug sm:text-[17px] dark:text-white">
				{item.title}
			</h3>
			<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
				{item.description}
			</p>
		</div>
	);
}

function TimelineCard({ item }: { item: TimelineItem }) {
	return (
		<div className="flex flex-col bg-bg-white-0 p-8 lg:p-10">
			<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/40">
				{item.year}
			</span>
			<h3 className="mt-4 font-semibold text-[15px] text-text-strong-950 leading-snug sm:text-[17px] dark:text-white">
				{item.title}
			</h3>
			<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
				{item.description}
			</p>
		</div>
	);
}

function ExploreCard({ link }: { link: ExploreLink }) {
	const className =
		"group flex flex-col justify-between bg-bg-white-0 p-8 transition-colors duration-300 hover:bg-neutral-950/[0.004] lg:p-10 dark:bg-transparent dark:hover:bg-white/[0.012]";

	const content = (
		<>
			<div>
				<h3 className="font-semibold text-[15px] text-text-strong-950 leading-snug group-hover:text-primary-base sm:text-[17px] dark:text-white">
					{link.title}
				</h3>
				<p className="mt-2 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
					{link.description}
				</p>
			</div>
			<Icon
				name="arrow-left"
				className="mt-8 size-4 rotate-180 text-text-sub-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 dark:text-white/40"
				aria-hidden
			/>
		</>
	);

	if (link.external) {
		return (
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				className={className}
			>
				{content}
			</a>
		);
	}

	return (
		<Link href={link.href} className={className}>
			{content}
		</Link>
	);
}

export function AboutUsSection() {
	return (
		<>
			<div className="mb-12 text-center lg:mb-16">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Reloop vs Reloop Labs
				</p>
				<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
					The platform and
					<br />
					<span className="text-primary-base">the company.</span>
				</h2>
				<p className="mx-auto mt-4 max-w-lg text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					Reloop is the open-source email stack. Reloop Labs is the team that
					builds it, runs the hosted service, and works with the community.
				</p>
			</div>

			<div className="overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
				<div className="grid gap-px lg:grid-cols-2">
					{entities.map((entity) => (
						<EntityColumn key={entity.title} entity={entity} />
					))}
				</div>
			</div>

			<div className="mt-24">
				<div className="mb-12 text-center lg:mb-16">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						What we do
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Three jobs.
						<br />
						<span className="text-primary-base">One open codebase.</span>
					</h2>
				</div>
				<div className="overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
					<div className="grid gap-px lg:grid-cols-3">
						{roles.map((item) => (
							<RoleCard key={item.title} item={item} />
						))}
					</div>
				</div>
			</div>

			<div className="mt-24">
				<div className="mb-12 text-center lg:mb-16">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Our story
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Started in 2025.
						<br />
						<span className="text-primary-base">Still shipping.</span>
					</h2>
					<p className="mx-auto mt-4 max-w-lg text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Reloop Labs began because email infrastructure shouldn't require
						trusting a vendor you can't audit—or running fragile SMTP yourself.
					</p>
				</div>
				<div className="overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
					<div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
						{timeline.map((item) => (
							<TimelineCard key={item.year + item.title} item={item} />
						))}
					</div>
				</div>
			</div>

			<div className="mt-24">
				<div className="mb-12 text-center lg:mb-16">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Go deeper
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Learn more about
						<br />
						<span className="text-primary-base">how we think.</span>
					</h2>
				</div>
				<div className="overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
					<div className="grid gap-px sm:grid-cols-2">
						{exploreLinks.map((link) => (
							<ExploreCard key={link.title} link={link} />
						))}
					</div>
				</div>
				<p className="mx-auto mt-10 max-w-lg text-center text-[14px] text-text-sub-600 leading-7 dark:text-white/45">
					Reach us anytime at{" "}
					<a
						href={`mailto:${contactEmail}`}
						className="font-semibold text-primary-base underline decoration-primary-base/30 underline-offset-4"
					>
						{contactEmail}
					</a>
					.
				</p>
			</div>
		</>
	);
}
