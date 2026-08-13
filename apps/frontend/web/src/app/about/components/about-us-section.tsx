import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { contactEmail } from "@reloop/web/lib/site";
import Image from "next/image";
import Link from "next/link";

type StoryChapter = {
	eyebrow: string;
	title: string;
	paragraphs: string[];
};

type Founder = {
	name: string;
	role: string;
	bio: string;
	image: string;
	github: string;
};

const story: StoryChapter[] = [
	{
		eyebrow: "The problem",
		title: "Every app needs email. Most infra makes you guess.",
		paragraphs: [
			"Password resets, receipts, onboarding, campaigns—email shows up in every product we ship. The options never felt right. Pay a proprietary vendor and trust routing logic you can't read. Or roll your own SMTP and pray deliverability holds when traffic spikes.",
			"Bills climbed. Black-box routing stayed black-box. At 2 a.m. with failed sends, the only thing to debug was a status page. We wanted what you probably want too: production-grade email you can audit, self-host, and actually understand.",
		],
	},
	{
		eyebrow: "September 2025",
		title: "Pranav and Twinkal started Reloop Labs.",
		paragraphs: [
			"Two engineers, one bet: build the full stack—not a thin API wrapper. Transactional sends, campaigns, SMTP relay, webhooks, analytics. The same capabilities as closed platforms, released under Apache 2.0 from the start.",
			"No stealth mode. No pitch deck. Issues on GitHub, progress in Discord, code anyone could clone and run. If we were going to fix email, we were going to do it where you could watch—and verify.",
		],
	},
	{
		eyebrow: "2025–2026",
		title: "We shipped the hard parts in public.",
		paragraphs: [
			"APIs and SDKs. Docker-based self-hosting. Agent inboxes for AI workflows. Deliverability tooling with logic you can trace in source. Every feature landed in one codebase—whether you deploy it yourself or use reloop.sh.",
			"Reloop Labs maintains that codebase and runs the hosted service. Same software, your choice of deployment. That wasn't a marketing line. It was the requirement.",
		],
	},
	{
		eyebrow: "July 2026",
		title: "Reloop is live. The code is still public.",
		paragraphs: [
			"Sign up and send 3,000 emails per month free—or clone the repo and run it on infrastructure you control. No enterprise fork. No features held for a sales call. Read every routing decision before you trust it.",
			"We're a team of two, shipping weekly, with a public roadmap. Early days—but the foundation is open, the stack is real, and we're not going back to closed email.",
		],
	},
];

const founders: Founder[] = [
	{
		name: "Pranav Patel",
		role: "Co-founder",
		bio: "Sets product direction and platform architecture. Keeps Reloop Labs focused on open source—not shortcuts.",
		image: "/company/team/pranav-patel.jpg",
		github: "https://github.com/pranavp10",
	},
	{
		name: "Twinkal P",
		role: "Co-founder",
		bio: "Builds the stack you deploy—same code on reloop.sh or your own servers.",
		image: "/company/team/twinkal-p.jpg",
		github: "https://github.com/twinkalp10",
	},
];

function StoryBlock({ chapter }: { chapter: StoryChapter }) {
	return (
		<article className="border-stroke-soft-200 border-t py-10 first:border-t-0 first:pt-0 sm:py-12 dark:border-white/10">
			<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
				{chapter.eyebrow}
			</p>
			<h3 className="mt-3 font-serif text-[1.75rem] text-text-strong-950 leading-[1.08] tracking-tighter sm:text-[2rem] dark:text-white">
				{chapter.title}
			</h3>
			<div className="mt-5 space-y-4">
				{chapter.paragraphs.map((paragraph) => (
					<p
						key={paragraph.slice(0, 40)}
						className="text-[15px] text-text-sub-600 leading-[1.75] sm:text-[16px] dark:text-white/55"
					>
						{paragraph}
					</p>
				))}
			</div>
		</article>
	);
}

function FounderCard({ founder, index }: { founder: Founder; index: number }) {
	return (
		<div
			className={cn(
				"flex flex-col border-stroke-soft-200 bg-bg-white-0 dark:border-white/10",
				index === 0
					? "border-b sm:border-r sm:border-b-0"
					: "border-b-0 sm:border-b-0",
			)}
		>
			<div className="relative aspect-[5/4] w-full overflow-hidden bg-neutral-100 dark:bg-white/5">
				<Image
					src={founder.image}
					alt={founder.name}
					fill
					className="object-cover object-center"
					sizes="(max-width: 1024px) 100vw, 50vw"
				/>
			</div>
			<div className="flex flex-1 flex-col p-6 sm:p-8">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
					{founder.role}
				</p>
				<h3 className="mt-2 font-semibold text-[17px] text-text-strong-950 leading-snug sm:text-[18px] dark:text-white">
					{founder.name}
				</h3>
				<p className="mt-2 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
					{founder.bio}
				</p>
				<a
					href={founder.github}
					target="_blank"
					rel="noopener noreferrer"
					className="group mt-5 inline-flex items-center gap-2 font-semibold text-[14px] text-text-strong-950 transition-colors hover:text-primary-base dark:text-white"
				>
					GitHub
					<Icon
						name="arrow-up-right"
						className="size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
						aria-hidden
					/>
				</a>
			</div>
		</div>
	);
}

export function AboutUsSection() {
	return (
		<>
			<div className="text-center">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Our story
				</p>
				<h2 className="mt-3.5 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
					How Reloop started.
				</h2>
			</div>

			<div className="mx-auto mt-10 max-w-3xl sm:mt-12">
				{story.map((chapter) => (
					<StoryBlock key={chapter.eyebrow} chapter={chapter} />
				))}
			</div>

			<div className="mt-20 sm:mt-24">
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Who we are
					</p>
					<h2 className="mt-3.5 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						Two founders. Still writing the code.
					</h2>
				</div>

				<div className="-mx-4 sm:-mx-6 lg:-mx-8 mt-10 border-stroke-soft-200 border-y sm:mt-12 sm:grid sm:grid-cols-2 dark:border-white/10">
					{founders.map((founder, index) => (
						<FounderCard key={founder.name} founder={founder} index={index} />
					))}
				</div>
			</div>

			<p className="mx-auto mt-14 max-w-2xl text-center text-[15px] text-text-sub-600 leading-[1.8] dark:text-white/50">
				Want the reasoning behind every decision? Read our{" "}
				<Link
					href="/philosophy/our-product-beliefs"
					className="font-semibold text-primary-link underline decoration-primary-link/30 underline-offset-4"
				>
					product beliefs
				</Link>{" "}
				and{" "}
				<Link
					href="/philosophy/engineering"
					className="font-semibold text-primary-link underline decoration-primary-link/30 underline-offset-4"
				>
					engineering principles
				</Link>
				. Questions?{" "}
				<a
					href={`mailto:${contactEmail}`}
					className="font-semibold text-primary-link underline decoration-primary-link/30 underline-offset-4"
				>
					{contactEmail}
				</a>
				.
			</p>
		</>
	);
}
