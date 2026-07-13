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
		<article className="border-stroke-soft-200 border-t pt-12 first:border-t-0 first:pt-0 dark:border-white/10">
			<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
				{chapter.eyebrow}
			</p>
			<h3 className="mt-4 font-serif text-[2rem] text-text-strong-950 leading-[1.08] tracking-tighter sm:text-[2.4rem] dark:text-white">
				{chapter.title}
			</h3>
			<div className="mt-6 space-y-5">
				{chapter.paragraphs.map((paragraph) => (
					<p
						key={paragraph.slice(0, 40)}
						className="text-[16px] text-text-sub-600 leading-[1.8] sm:text-[17px] dark:text-white/55"
					>
						{paragraph}
					</p>
				))}
			</div>
		</article>
	);
}

function FounderCard({ founder }: { founder: Founder }) {
	return (
		<div className="flex flex-col bg-bg-white-0">
			<div className="relative aspect-[5/4] w-full overflow-hidden bg-neutral-100 dark:bg-white/5">
				<Image
					src={founder.image}
					alt={founder.name}
					fill
					className="object-cover object-center"
					sizes="(max-width: 1024px) 100vw, 50vw"
				/>
			</div>
			<div className="flex flex-1 flex-col p-8 lg:p-10">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
					{founder.role}
				</p>
				<h3 className="mt-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
					{founder.name}
				</h3>
				<p className="mt-2 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
					{founder.bio}
				</p>
				<a
					href={founder.github}
					target="_blank"
					rel="noopener noreferrer"
					className="group mt-6 inline-flex items-center gap-2 font-semibold text-[14px] text-text-strong-950 transition-colors hover:text-primary-base dark:text-white"
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
		<div className="mx-auto max-w-2xl">
			<h2 className="mb-12 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:mb-16 dark:text-white">
				Our story.
			</h2>

			<div className="space-y-12 lg:space-y-16">
				{story.map((chapter) => (
					<StoryBlock key={chapter.eyebrow} chapter={chapter} />
				))}
			</div>

			<div className="mt-20 border-stroke-soft-200 border-t pt-16 lg:mt-24 lg:pt-20 dark:border-white/10">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Who we are
				</p>
				<h2 className="mt-4 font-serif text-[2rem] text-text-strong-950 leading-[1.08] tracking-tighter sm:text-[2.4rem] dark:text-white">
					Two founders. Still writing the code.
				</h2>
			</div>

			<div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-4xl border border-stroke-soft-200 bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10">
				<div className="grid gap-px lg:grid-cols-2">
					{founders.map((founder) => (
						<FounderCard key={founder.name} founder={founder} />
					))}
				</div>
			</div>

			<p className="mt-16 text-center text-[15px] text-text-sub-600 leading-[1.8] dark:text-white/50">
				Want the reasoning behind every decision? Read{" "}
				<Link
					href="/philosophy/why-reloop"
					className="font-semibold text-primary-link underline decoration-primary-link/30 underline-offset-4"
				>
					why we built Reloop
				</Link>{" "}
				and{" "}
				<Link
					href="/philosophy/what-we-stand-for"
					className="font-semibold text-primary-link underline decoration-primary-link/30 underline-offset-4"
				>
					what we won't compromise on
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
		</div>
	);
}
