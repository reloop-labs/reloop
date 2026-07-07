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
		eyebrow: "Where it started",
		title: "Email infrastructure kept failing us.",
		paragraphs: [
			"Every project we shipped needed email—password resets, receipts, onboarding, campaigns. And every time, the same tradeoff: trust a proprietary vendor you can't audit, or wire up fragile SMTP yourself and hope deliverability holds.",
			"Pricing crept up. Routing logic stayed hidden. When something broke at 2 a.m., there was nothing to read except a status page. We kept asking the same question: why can't this be open, self-hostable, and good enough to run in production?",
		],
	},
	{
		eyebrow: "September 2025",
		title: "Pranav and Twinkal founded Reloop Labs.",
		paragraphs: [
			"Two engineers, one decision—build the email stack we wished existed. Not a wrapper around someone else's API. A full platform: transactional sends, campaigns, SMTP, webhooks, analytics—the same capabilities as proprietary providers, under Apache 2.0.",
			"We started in public. Issues on GitHub, progress in Discord, code anyone could clone. No stealth mode, no pitch deck. Just shipping.",
		],
	},
	{
		eyebrow: "2025–2026",
		title: "We built the hard parts in the open.",
		paragraphs: [
			"APIs and SDKs. Self-hosting with Docker. Agent inboxes for AI workflows. Deliverability tooling you can actually inspect. Each piece went into the same codebase—whether you run it on your servers or use reloop.sh.",
			"Reloop Labs maintains that codebase and operates the hosted service. Same software, your choice of deployment. That was the point from day one.",
		],
	},
	{
		eyebrow: "July 2026",
		title: "Reloop goes live.",
		paragraphs: [
			"Hosted and self-host from launch day. No forked enterprise edition, no features locked behind a sales call. Read the source, run it yourself, or sign up and send—3,000 emails per month free.",
			"We're early. A team of two, a public roadmap, and weekly releases. But the foundation is solid, the code is public, and we're not going back to closed email.",
		],
	},
];

const founders: Founder[] = [
	{
		name: "Pranav Patel",
		role: "Co-founder",
		bio: "Product, platform architecture, and Reloop Labs.",
		image: "/company/team/pranav-patel.jpg",
		github: "https://github.com/pranavp10",
	},
	{
		name: "Twinkal P",
		role: "Co-founder",
		bio: "Platform engineering and the open-source stack.",
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
			<h2 className="mt-4 font-serif text-[2rem] text-text-strong-950 leading-[1.08] tracking-tighter sm:text-[2.4rem] dark:text-white">
				{chapter.title}
			</h2>
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
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/40">
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
						name="arrow-left"
						className="size-3.5 rotate-180 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
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
			<div className="space-y-12 lg:space-y-16">
				{story.map((chapter) => (
					<StoryBlock key={chapter.eyebrow} chapter={chapter} />
				))}
			</div>

			<div className="mt-20 border-stroke-soft-200 border-t pt-16 dark:border-white/10 lg:mt-24 lg:pt-20">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					The team
				</p>
				<h2 className="mt-4 font-serif text-[2rem] text-text-strong-950 leading-[1.08] tracking-tighter sm:text-[2.4rem] dark:text-white">
					Built by Pranav and Twinkal.
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
				Want to know why we built it this way? Read{" "}
				<Link
					href="/philosophy/why-reloop"
					className="font-semibold text-primary-base underline decoration-primary-base/30 underline-offset-4"
				>
					why Reloop
				</Link>{" "}
				and{" "}
				<Link
					href="/philosophy/what-we-stand-for"
					className="font-semibold text-primary-base underline decoration-primary-base/30 underline-offset-4"
				>
					what we stand for
				</Link>
				. Or reach us at{" "}
				<a
					href={`mailto:${contactEmail}`}
					className="font-semibold text-primary-base underline decoration-primary-base/30 underline-offset-4"
				>
					{contactEmail}
				</a>
				.
			</p>
		</div>
	);
}
