import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import CTA from "@reloop/web/app/(home)/components/cta";
import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import { type Testimonial, testimonials } from "@reloop/web/lib/testimonials";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/wall-of-love`;
const pageTitle = "Wall of Love | Reloop";
const pageDescription =
	"What developers are saying about Reloop, the open-source email infrastructure for sending, receiving, and managing email.";

const shareOnXHref = `https://x.com/intent/post?text=${encodeURIComponent(
	"Sending email with @reloop_labs ",
)}`;

export const metadata: Metadata = {
	title: "Wall of Love",
	description: pageDescription,
	keywords: [
		"Reloop wall of love",
		"Reloop reviews",
		"Reloop testimonials",
		"open source email reviews",
		"Resend alternative reviews",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
	},
};

const wallOfLoveSchema = {
	"@context": "https://schema.org",
	"@type": "CollectionPage",
	name: pageTitle,
	description: pageDescription,
	url: pageUrl,
};

function TestimonialCard({ item }: { item: Testimonial }) {
	const body = (
		<>
			<div>
				<div className="flex items-center gap-3">
					<div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stroke-soft-100 bg-zinc-100 font-medium text-xs text-zinc-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300">
						{item.avatarUrl ? (
							<img
								alt={item.name}
								loading="lazy"
								width={32}
								height={32}
								decoding="async"
								className="size-full object-cover"
								src={item.avatarUrl}
							/>
						) : (
							item.initials
						)}
					</div>
					<h3 className="truncate font-medium text-xl text-zinc-950 lg:tracking-tight dark:text-white">
						{item.name}
					</h3>
				</div>
				<p className="mt-4 whitespace-pre-line text-pretty font-medium text-lg text-zinc-900 leading-relaxed sm:text-xl dark:text-zinc-100">
					{item.quote}
				</p>
			</div>
			{item.sourceUrl && (
				<div className="flex items-center gap-1 pt-2 font-mono text-xs text-zinc-400 dark:text-zinc-500">
					View on X
					<ArrowUpRight className="group-hover:-translate-y-0.5 size-3.5 duration-200 group-hover:translate-x-0.5" />
				</div>
			)}
		</>
	);

	const className =
		"group flex flex-col justify-between space-y-6 bg-white p-6 transition-colors duration-200 hover:bg-zinc-50/60 sm:p-8 lg:p-12 dark:bg-black dark:hover:bg-zinc-950/70";

	if (!item.sourceUrl) return <div className={className}>{body}</div>;

	return (
		<a
			href={item.sourceUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={className}
		>
			{body}
		</a>
	);
}

export default function WallOfLovePage() {
	return (
		<div className="w-full bg-white text-zinc-950 dark:bg-black dark:text-zinc-50">
			<JsonLd data={wallOfLoveSchema} />

			{/* Main responsive grid shell with exact home page max-width and border colors */}
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				{/* Hero: left-aligned, same layout as /changelog */}
				<section className="px-6 pt-28 pb-14 text-left sm:px-10 sm:pt-32 sm:pb-16 lg:px-12">
					<h1 className="max-w-3xl font-semibold text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Wall of love
					</h1>
					<p className="mt-3 max-w-2xl text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
						What developers are saying about Reloop, in their own words. Built
						something with Reloop? Tell us about it.
					</p>
					<div className="mt-6 flex w-fit items-center gap-2">
						<Button.Root variant="neutral" mode="stroke" size="small" asChild>
							<a href={shareOnXHref} target="_blank" rel="noopener noreferrer">
								<Icon name="twitter" className="size-3.5" aria-hidden="true" />
								Post on X
							</a>
						</Button.Root>
						<Button.Root variant="neutral" mode="stroke" size="small" asChild>
							<a
								href={socialProfiles.discord}
								target="_blank"
								rel="noopener noreferrer"
							>
								Join the Discord
							</a>
						</Button.Root>
					</div>
				</section>

				<section className="grid grid-cols-1 gap-px border-stroke-soft-100 border-t bg-stroke-soft-100 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
					{testimonials.map((item) => (
						<TestimonialCard key={item.sourceUrl ?? item.name} item={item} />
					))}
				</section>

				{/* Bottom CTA Section */}
				<div className="border-stroke-soft-100 border-t pt-24 dark:border-white/10">
					<CTA
						headlineLine1="Start sending email today"
						headlineLine2="$0 / mo."
						subtext="No credit card required. 3,000 emails for free."
						primaryLabel="Get started free"
						secondaryLabel="Talk to founder"
					/>
				</div>
			</div>
		</div>
	);
}
