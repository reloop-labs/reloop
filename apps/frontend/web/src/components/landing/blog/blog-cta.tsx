import * as Button from "@reloop/ui/button";
import Link from "next/link";

type CategoryVariant = {
	headline: string;
	sub: string;
	primaryLabel: string;
	secondaryLabel: string;
	/** Tailwind-safe inline color for the radial glow */
	glowColor: string;
};

const DEFAULT_VARIANT: CategoryVariant = {
	headline: "Send email that actually arrives.",
	sub: "Open-source email infrastructure with a generous free tier. No vendor lock-in.",
	primaryLabel: "Get started free",
	secondaryLabel: "Read the docs",
	glowColor: "rgba(99,102,241,0.18)",
};

const CATEGORY_VARIANTS: Record<string, CategoryVariant> = {
	Engineering: {
		headline: "Ship email without the infrastructure headache.",
		sub: "Drop-in SMTP + REST API. Reloop handles queuing, retries, and observability so you don't have to.",
		primaryLabel: "Start building free",
		secondaryLabel: "Explore the API",
		glowColor: "rgba(59,130,246,0.18)",
	},
	"AI & Automation": {
		headline: "Connect your AI agents to reliable email delivery.",
		sub: "Fire transactional emails straight from your LLM workflows — with built-in rate limiting and full logs.",
		primaryLabel: "Try it free",
		secondaryLabel: "See the API",
		glowColor: "rgba(168,85,247,0.2)",
	},
	Growth: {
		headline: "Turn email into your highest-ROI growth channel.",
		sub: "Activation flows, re-engagement sequences, and product-led drips — all from one open-source platform.",
		primaryLabel: "Get started free",
		secondaryLabel: "View docs",
		glowColor: "rgba(16,185,129,0.18)",
	},
	"Self-Hosting": {
		headline: "Your email stack, your servers, your rules.",
		sub: "Self-host Reloop in minutes. Full control over data, routing, and compliance — forever.",
		primaryLabel: "Deploy today",
		secondaryLabel: "Self-host guide",
		glowColor: "rgba(245,158,11,0.18)",
	},
	Deliverability: {
		headline: "Stop ending up in spam.",
		sub: "Reloop gives you built-in SPF/DKIM/DMARC setup, IP warming guidance, and real-time deliverability signals.",
		primaryLabel: "Get started free",
		secondaryLabel: "Deliverability docs",
		glowColor: "rgba(239,68,68,0.16)",
	},
	Tutorials: {
		headline: "Ready to integrate? It takes under five minutes.",
		sub: "SDKs for Node.js, Python, Go, and more. Drop in Reloop and send your first email before coffee cools.",
		primaryLabel: "Start building",
		secondaryLabel: "Browse SDKs",
		glowColor: "rgba(6,182,212,0.18)",
	},
	"Open Source": {
		headline: "Join the open-source email movement.",
		sub: "Reloop is MIT-licensed, community-driven, and free to self-host. Star us on GitHub — or start using the hosted tier right now.",
		primaryLabel: "Get started free",
		secondaryLabel: "GitHub →",
		glowColor: "rgba(99,102,241,0.18)",
	},
};

export function BlogCta({ category }: { category: string }) {
	const variant = CATEGORY_VARIANTS[category] ?? DEFAULT_VARIANT;
	const isGitHubSecondary = variant.secondaryLabel === "GitHub →";

	return (
		<div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0f]">
			{/* Subtle grid */}
			<div
				className="pointer-events-none absolute inset-0 rounded-2xl"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
					backgroundSize: "36px 36px",
				}}
			/>
			{/* Category-aware radial glow */}
			<div
				className="pointer-events-none absolute inset-0 rounded-2xl"
				style={{
					background: `radial-gradient(ellipse 70% 90% at 50% 50%, ${variant.glowColor} 0%, transparent 70%)`,
				}}
			/>

			<div className="relative flex flex-col items-center gap-7 px-8 py-14 text-center sm:px-14">
				{/* Category badge */}
				<span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-[11px] text-white/50 uppercase tracking-widest">
					{category}
				</span>

				<div className="flex flex-col items-center gap-3">
					<h2 className="font-semibold text-2xl text-white leading-tight tracking-tight sm:text-3xl">
						{variant.headline}
					</h2>
					<p className="max-w-md text-[15px] text-white/50 leading-relaxed">
						{variant.sub}
					</p>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-3">
					<Link
						href="/dashboard/signup"
						className={Button.buttonVariants({ variant: "neutral" }).root({
							className:
								"rounded-full bg-white! px-6 font-semibold! text-[#0d0d0f]! transition-opacity hover:bg-white/90!",
						})}
					>
						{variant.primaryLabel}
					</Link>
					<Link
						href={
							isGitHubSecondary
								? "https://github.com/reloop-labs/reloop"
								: "/docs"
						}
						target={isGitHubSecondary ? "_blank" : undefined}
						rel={isGitHubSecondary ? "noopener noreferrer" : undefined}
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({
							className:
								"rounded-full border-white/15! px-6 text-white/70! transition-all hover:border-white/35! hover:bg-white/5! hover:text-white!",
						})}
					>
						{variant.secondaryLabel}
					</Link>
				</div>
			</div>
		</div>
	);
}
