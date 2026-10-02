"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import type { AlternativeDefinition } from "@reloop/web/lib/landing/types";
import { breadcrumbJsonLd, faqPageJsonLd } from "@reloop/web/lib/schema";
import Link from "next/link";

const competitorAccent: Record<string, string> = {
	resend: "border-black bg-neutral-50 dark:bg-neutral-900",
	sendgrid: "border-[#51A9E3]/30 bg-[#51A9E3]/5",
	mailgun: "border-red-500/20 bg-red-500/5",
	"aws-ses": "border-orange-500/20 bg-orange-500/5",
	postmark: "border-yellow-400/30 bg-yellow-400/5",
	mailchimp: "border-yellow-500/20 bg-yellow-500/5",
	loops: "border-violet-500/20 bg-violet-500/5",
};

export function AlternativePageView({
	config,
}: {
	config: AlternativeDefinition;
}) {
	const cardClass =
		competitorAccent[config.slug] ?? "border-stroke-soft-200 bg-bg-weak-50";

	return (
		<div className="min-h-screen bg-[#fafafa] dark:bg-black">
			<JsonLd
				data={[
					breadcrumbJsonLd([
						{ name: "Alternatives", path: "/alternatives" },
						{ name: `${config.competitorName} alternative`, path: config.path },
					]),
					...(config.faqs?.length ? [faqPageJsonLd(config.faqs)] : []),
				]}
			/>
			{/* VS header: alternative.to / G2 pattern */}
			<div className="border-stroke-soft-200 border-b bg-white dark:border-white/10 dark:bg-[#0a0a0a]">
				<div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
					<nav className="mb-6 text-[13px] text-text-sub-600 dark:text-white/55">
						<Link href="/alternatives" className="hover:text-primary-base">
							Alternatives
						</Link>
						<span className="mx-2">/</span>
						<span>{config.competitorName}</span>
					</nav>
					<div className="flex items-center justify-center gap-4 sm:gap-8">
						<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 px-6 py-4 font-bold text-lg dark:border-white/10">
							Reloop
						</div>
						<span className="font-serif text-2xl text-text-sub-600 dark:text-white/30">
							vs
						</span>
						<div
							className={`rounded-2xl border px-6 py-4 font-bold text-lg ${cardClass}`}
						>
							{config.competitorName}
						</div>
					</div>
					<h1 className="mt-8 font-semibold text-3xl tracking-tight sm:text-4xl">
						{config.titleLines.join(" ")}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-[16px] text-text-sub-600 dark:text-white/50">
						{config.description}
					</p>
					{config.updatedAt ? (
						<p className="mt-4 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/40">
							Last updated {config.updatedAt} · By Reloop Labs
						</p>
					) : null}
					<div className="mt-8 flex flex-wrap justify-center gap-3">
						<Link
							href={config.primaryCta?.href ?? "/dashboard/signup"}
							className={Button.buttonVariants({ variant: "neutral" }).root({
								className: "rounded-full",
							})}
						>
							{config.primaryCta?.label ?? "Try Reloop free"}
						</Link>
						<Link
							href={config.compareHref}
							className={Button.buttonVariants({
								mode: "stroke",
								variant: "neutral",
							}).root({
								className: "rounded-full",
							})}
						>
							Full comparison →
						</Link>
					</div>
				</div>
			</div>

			{/* Why switch checklist */}
			<div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
				<h2 className="font-semibold text-text-strong-950 text-xl dark:text-white">
					Why teams switch from {config.competitorName}
				</h2>
				<ul className="mt-8 space-y-4">
					{config.highlights.map((item) => (
						<li
							key={item}
							className="flex gap-3 rounded-xl border border-stroke-soft-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]"
						>
							<Icon
								name="check"
								className="mt-0.5 size-5 shrink-0 text-emerald-500"
							/>
							<span className="text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
								{item}
							</span>
						</li>
					))}
				</ul>

				{config.sections[0] && (
					<div className="mt-12 grid gap-4 sm:grid-cols-3">
						{config.sections[0].items.map((item) => (
							<div
								key={item.title}
								className="rounded-xl border border-stroke-soft-200 p-5 dark:border-white/10"
							>
								<p className="font-semibold text-[14px]">{item.title}</p>
								<p className="mt-2 text-[13px] text-text-sub-600 dark:text-white/55">
									{item.description}
								</p>
							</div>
						))}
					</div>
				)}

				{/* Honest trade-offs: balanced presentation builds trust + targets "should I switch" queries */}
				<div className="mt-12 rounded-2xl border border-stroke-soft-200 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-[#111]">
					<h2 className="font-semibold text-lg text-text-strong-950 dark:text-white">
						Honest trade-offs
					</h2>
					<div className="mt-4 grid gap-6 text-[14px] leading-relaxed sm:grid-cols-2">
						<div>
							<p className="font-semibold text-emerald-600 dark:text-emerald-400">
								Choose Reloop when…
							</p>
							<ul className="mt-2 list-disc space-y-1.5 pl-5 text-text-sub-600 dark:text-white/60">
								<li>You want source access and a self-host exit ramp.</li>
								<li>You send 50k+ emails/month and overage stings.</li>
								<li>
									You need campaigns, inbound, and agent email in one place.
								</li>
							</ul>
						</div>
						<div>
							<p className="font-semibold text-text-strong-950 dark:text-white">
								Stay on {config.competitorName} when…
							</p>
							<ul className="mt-2 list-disc space-y-1.5 pl-5 text-text-sub-600 dark:text-white/60">
								<li>Hosted-only simplicity already fits your workflow.</li>
								<li>Volume is low and migration cost outweighs savings.</li>
								<li>
									Your team lives in {config.competitorName}-native features.
								</li>
							</ul>
						</div>
					</div>
					<p className="mt-5 text-[13px] text-text-sub-600 dark:text-white/50">
						This page is by Reloop Labs, the team behind Reloop. Pricing is
						public list prices as of {config.updatedAt ?? "2026"} — verify on{" "}
						<Link href="/pricing" className="underline underline-offset-2">
							reloop.sh/pricing
						</Link>{" "}
						and the competitor&apos;s site. Full head-to-head:{" "}
						<Link
							href={config.compareHref}
							className="font-semibold text-primary-base"
						>
							Reloop vs {config.competitorName}
						</Link>
						.
					</p>
				</div>

				{config.faqs?.length ? (
					<div className="mt-12">
						<h2 className="font-semibold text-text-strong-950 text-xl dark:text-white">
							{config.competitorName} alternative FAQ
						</h2>
						<div className="mt-6 space-y-3">
							{config.faqs.map((faq) => (
								<details
									key={faq.question}
									className="group rounded-xl border border-stroke-soft-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]"
								>
									<summary className="cursor-pointer font-semibold text-[15px] text-text-strong-950 dark:text-white">
										{faq.question}
									</summary>
									<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
										{faq.answer}
									</p>
								</details>
							))}
						</div>
					</div>
				) : null}
			</div>

			<ToolUpsell
				title={config.cta.title}
				description={config.cta.description ?? ""}
				primaryHref={config.cta.primary.href}
				primaryLabel={config.cta.primary.label}
				secondaryHref={config.compareHref}
				secondaryLabel={`Compare with ${config.competitorName}`}
			/>
		</div>
	);
}
