"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import type { AlternativeDefinition } from "@reloop/web/lib/landing/types";
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
			{/* VS header — alternative.to / G2 pattern */}
			<div className="border-stroke-soft-200 border-b bg-white dark:border-white/10 dark:bg-[#0a0a0a]">
				<div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
					<nav className="mb-6 text-[13px] text-text-sub-600 dark:text-white/40">
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
					<div className="mt-8 flex flex-wrap justify-center gap-3">
						<Link
							href={config.primaryCta?.href ?? "/dashboard/signup"}
							className={Button.buttonVariants({ variant: "neutral" }).root({
								className: "rounded-xl",
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
								className: "rounded-xl",
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
								<p className="mt-2 text-[13px] text-text-sub-600 dark:text-white/45">
									{item.description}
								</p>
							</div>
						))}
					</div>
				)}
			</div>

			<ToolUpsell
				title={config.cta.title}
				description={config.cta.description}
				primaryHref={config.cta.primary.href}
				primaryLabel={config.cta.primary.label}
				secondaryHref={config.compareHref}
				secondaryLabel={`Compare with ${config.competitorName}`}
			/>
		</div>
	);
}
