import Image from "next/image";
import Link from "next/link";
import {
	PLATFORM_ALT,
	type PlatformTabId,
	TAB_GRADIENTS,
	TAB_SCREENSHOT,
	TABS,
} from "./platform-tabs-data";

type ShowcaseCopy = {
	headline: string;
	subcopy: string;
	ctaLabel: string;
	ctaHref: string;
};

const SHOWCASE_COPY: Partial<Record<PlatformTabId, ShowcaseCopy>> = {
	email: {
		headline: "Send transactional email over API or SMTP",
		subcopy:
			"One REST API plus a managed relay for everything else. Drop in an SDK or point your existing mailer at Reloop with zero rewrites.",
		ctaLabel: "Explore the email API",
		ctaHref: "/features/transaction-emails",
	},
	analytics: {
		headline: "Watch delivery, opens, and bounces live",
		subcopy:
			"Per-message logs, complaint tracking, and bounce diagnostics stream into one dashboard the moment you hit send.",
		ctaLabel: "Explore analytics",
		ctaHref: "/features/email-analytics",
	},
	templates: {
		headline: "Design production-ready emails with AI",
		subcopy:
			"Describe what you need in plain language and generate on-brand emails — then refine every detail in the visual editor.",
		ctaLabel: "Explore AI templates",
		ctaHref: "/features/email-templates",
	},
	agents: {
		headline: "Give every AI agent an inbox",
		subcopy:
			"Inbound email with spam scoring, threading, and triage built in — so agents can read, decide, and reply without custom plumbing.",
		ctaLabel: "Explore the agent inbox",
		ctaHref: "/features/ai-agents",
	},
	campaigns: {
		headline: "Send marketing emails in minutes",
		subcopy:
			"Broadcasts, segments, and scheduling on the same infrastructure as your transactional sends — no second vendor required.",
		ctaLabel: "Explore campaigns",
		ctaHref: "/features/email-marketing",
	},
};

const CTA_CLASS =
	"inline-flex h-8 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent bg-card px-3 font-medium text-xs text-foreground shadow-black/15 shadow-sm ring-1 ring-foreground/10 duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:ring-foreground/15 dark:hover:bg-muted/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

function ShowcaseBlock({ id }: { id: PlatformTabId }) {
	const tab = TABS.find((t) => t.id === id);
	const copy = SHOWCASE_COPY[id];
	const shot = TAB_SCREENSHOT[id];
	if (!tab || !copy) return null;

	return (
		<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x border-t md:max-w-7xl dark:border-white/10">
			<div className="bg-white py-16 lg:py-24 dark:bg-black">
				<div className="mx-auto w-full max-w-5xl px-6 xl:px-0">
					<div className="mx-auto max-w-2xl space-y-6 text-center">
						<h2
							id={`showcase-${id}-heading`}
							className="text-balance font-semibold text-4xl text-foreground lg:text-5xl"
						>
							{copy.headline}
						</h2>
						<p className="mb-8 text-balance text-lg text-muted-foreground">
							{copy.subcopy}
						</p>
						<Link href={copy.ctaHref} className={CTA_CLASS}>
							{copy.ctaLabel}
						</Link>
					</div>
				</div>
			</div>

			<div className="border-stroke-soft-100 border-t dark:border-white/10">
				<div className="relative h-[560px] w-full overflow-hidden bg-bg-white-0 sm:h-[640px] lg:h-[720px] dark:bg-black">
					<div
						aria-hidden
						className={`absolute inset-0 bg-gradient-to-b ${TAB_GRADIENTS[id]}`}
					/>
					<div className="relative h-full w-full px-10 pt-10">
						<div className="relative h-full w-full overflow-hidden border border-stroke-soft-100 border-b-0 bg-bg-white-0 dark:border-white/10 dark:bg-black">
							<Image
								src={shot.src}
								alt={PLATFORM_ALT[id]}
								fill
								sizes="100vw"
								className="object-cover object-top dark:hidden"
								loading="lazy"
								draggable={false}
							/>
							<Image
								src={shot.darkSrc}
								alt=""
								aria-hidden
								fill
								sizes="100vw"
								className="hidden object-cover object-top dark:block"
								loading="lazy"
								draggable={false}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function PlatformShowcase() {
	return (
		<div className="w-full overflow-hidden bg-white dark:bg-black">
			{TABS.map((tab) => (
				<ShowcaseBlock key={tab.id} id={tab.id} />
			))}
		</div>
	);
}
