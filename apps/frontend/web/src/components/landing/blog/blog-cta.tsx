import { CtaLink } from "@reloop/web/components/landing/cta";

type CategoryVariant = {
	headline: string;
	sub: string;
	primaryLabel: string;
};

const DEFAULT_VARIANT: CategoryVariant = {
	headline: "Ready to send?",
	sub: "Open-source email infrastructure with a generous free tier. No vendor lock-in.",
	primaryLabel: "Get started free",
};

const CATEGORY_VARIANTS: Record<string, CategoryVariant> = {
	Engineering: {
		headline: "Ready to ship email?",
		sub: "Drop-in SMTP + REST API. Reloop handles queuing, retries, and observability so you don't have to.",
		primaryLabel: "Start building free",
	},
	"AI & Automation": {
		headline: "Ready to connect your agents?",
		sub: "Fire transactional emails straight from your LLM workflows — with built-in rate limiting and full logs.",
		primaryLabel: "Try it free",
	},
	Growth: {
		headline: "Ready to grow with email?",
		sub: "Activation flows, re-engagement sequences, and product-led drips — all from one open-source platform.",
		primaryLabel: "Get started free",
	},
	"Self-Hosting": {
		headline: "Ready to deploy?",
		sub: "Self-host Reloop in minutes. Full control over data, routing, and compliance — forever.",
		primaryLabel: "Deploy today",
	},
	Deliverability: {
		headline: "Ready to reach the inbox?",
		sub: "Built-in SPF/DKIM/DMARC setup, IP warming guidance, and real-time deliverability signals.",
		primaryLabel: "Get started free",
	},
	Tutorials: {
		headline: "Ready to integrate?",
		sub: "SDKs for Node.js, Python, Go, and more. Send your first email in under five minutes.",
		primaryLabel: "Start building",
	},
	"Open Source": {
		headline: "Ready to contribute?",
		sub: "Reloop is MIT-licensed, community-driven, and free to self-host. Star us on GitHub or start on the hosted tier.",
		primaryLabel: "Get started free",
	},
	Migration: {
		headline: "Ready to switch?",
		sub: "Move from SendGrid, Mailgun, or Resend with compatible APIs, clear docs, and a free tier to test before you cut over.",
		primaryLabel: "Start migrating free",
	},
	Comparison: {
		headline: "Ready to choose?",
		sub: "Reloop is open source, self-hostable, and priced for builders — compare plans and features before you commit.",
		primaryLabel: "Get started free",
	},
};

export function BlogCta({ category }: { category: string }) {
	const variant = CATEGORY_VARIANTS[category] ?? DEFAULT_VARIANT;

	return (
		<section className="w-full mt-12">
			<div className="relative overflow-hidden border-stroke-soft-200 border-y bg-bg-white-0 px-6 py-10 sm:px-10 sm:py-12 dark:border-white/10 dark:bg-black">
				{/* Diagonal hatch line graphic using primary color */}
				<div
					aria-hidden
					className="pointer-events-none absolute top-0 right-0 bottom-0 w-full text-primary-base/40 sm:w-1/2 dark:text-primary-base/50"
					style={{
						backgroundImage:
							"repeating-linear-gradient(-45deg, transparent 0, transparent 8px, currentColor 8px, currentColor 9.5px)",
						maskImage:
							"linear-gradient(to right, transparent 0%, black 50%, black 100%)",
						WebkitMaskImage:
							"linear-gradient(to right, transparent 0%, black 50%, black 100%)",
					}}
				/>

				<div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between md:max-w-7xl">
					<div className="max-w-2xl">
						<h2 className="font-serif text-2xl text-text-strong-950 leading-tight tracking-tight sm:text-3xl lg:text-[2.1rem] dark:text-white">
							{variant.headline}
						</h2>
						<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							{variant.sub}
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3 shrink-0">
						<CtaLink
							label={variant.primaryLabel}
							href="/dashboard/signup"
							filled
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
