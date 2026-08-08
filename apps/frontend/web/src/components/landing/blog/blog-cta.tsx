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
		<section>
			<div className="w-full px-4 pt-16 pb-16 sm:px-6 sm:pt-20 sm:pb-20 lg:px-8 lg:pt-24 lg:pb-24">
				<div className="rounded-4xl border border-stroke-soft-200 bg-bg-weak-50 px-8 py-12 sm:px-12 sm:py-14 lg:px-14 dark:border-white/[0.08] dark:bg-[#161616]">
					<div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-xl">
							<h2 className="font-serif text-2xl text-text-strong-950 leading-tight tracking-tight sm:text-[1.75rem] dark:text-white">
								{variant.headline}
							</h2>
							<p className="mt-3 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{variant.sub}
							</p>
						</div>

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
