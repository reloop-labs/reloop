"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import { getIntegrationEnrichment } from "@reloop/web/lib/landing/integrations/enrichment";
import { accentStyles } from "@reloop/web/lib/landing/page-accents";
import type { LandingPageDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";
import { useState } from "react";

export function IntegrationPageView({
	config,
}: {
	config: LandingPageDefinition;
}) {
	const extra = getIntegrationEnrichment(config.slug);
	const accent = accentStyles[extra.accent];
	const [copied, setCopied] = useState(false);

	async function copyInstall() {
		await navigator.clipboard.writeText(extra.install);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="min-h-screen bg-[#0d1117] text-white">
			{/* Docs-style header (Resend / Stripe docs) */}
			<div className="border-white/10 border-b">
				<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
					<nav className="mb-4 flex gap-2 text-[13px] text-white/40">
						<Link href="/docs/integrations" className="hover:text-white">
							Integrations
						</Link>
						<span>/</span>
						<span className="text-white/70">{config.titleLines.join(" ")}</span>
					</nav>
					<span
						className={`inline-flex rounded-md px-2 py-1 font-mono text-[11px] ${accent.badge}`}
					>
						{extra.language}
					</span>
					<h1 className="mt-4 font-semibold text-3xl tracking-tight">
						{config.titleLines.join(" ")}
					</h1>
					<p className="mt-3 max-w-2xl text-[16px] text-white/55">
						{config.description}
					</p>

					<div className="mt-6 flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 p-1 pl-4 font-mono text-[13px]">
						<span className="flex-1 text-emerald-400">{extra.install}</span>
						<button
							type="button"
							onClick={copyInstall}
							className="rounded-md bg-white/10 px-3 py-2 text-[12px] hover:bg-white/15"
						>
							{copied ? "Copied" : "Copy"}
						</button>
					</div>
				</div>
			</div>

			<div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_1fr]">
				{/* Sticky steps sidebar */}
				<aside className="lg:sticky lg:top-24 lg:self-start">
					<p className="font-semibold text-[11px] text-white/40 uppercase tracking-wider">
						Steps
					</p>
					<ol className="mt-4 space-y-4">
						{extra.steps.map((step, i) => (
							<li key={step.title} className="flex gap-3">
								<span
									className={`flex size-6 shrink-0 items-center justify-center rounded-full font-bold text-[11px] text-white ${accent.bg}`}
								>
									{i + 1}
								</span>
								<div>
									<p className="font-medium text-[14px]">{step.title}</p>
									<p className="mt-1 text-[12px] text-white/45">{step.body}</p>
								</div>
							</li>
						))}
					</ol>
				</aside>

				<div>
					<div className="overflow-hidden rounded-xl border border-white/10 bg-[#161b22]">
						<div className="border-white/10 border-b px-4 py-2 font-mono text-[11px] text-white/40">
							Quickstart
						</div>
						<pre className="overflow-x-auto p-5 font-mono text-[#79c0ff] text-[12px] leading-relaxed">
							{extra.code}
						</pre>
					</div>

					{config.relatedLinks && (
						<div className="mt-8 flex flex-wrap gap-2">
							{config.relatedLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="rounded-lg border border-white/10 px-3 py-2 text-[13px] text-white/60 hover:border-white/25 hover:text-white"
								>
									{link.label} →
								</Link>
							))}
						</div>
					)}

					<div className="mt-10 flex gap-3">
						<Link
							href={config.primaryCta?.href ?? "/dashboard/signup"}
							className={Button.buttonVariants({ variant: "neutral" }).root({
								className: "rounded-full bg-white! text-black!",
							})}
						>
							{config.primaryCta?.label ?? "Get API key"}
						</Link>
						<Link
							href="/docs"
							className="inline-flex items-center gap-1 rounded-full border border-white/15 px-5 py-2.5 text-[14px] text-white/70 hover:bg-white/5"
						>
							<Icon name="book-open" className="size-4" />
							Docs
						</Link>
					</div>
				</div>
			</div>

			<ToolUpsell
				title={config.cta.title}
				description={config.cta.description}
				primaryHref={config.cta.primary.href}
				primaryLabel={config.cta.primary.label}
				secondaryHref={config.cta.secondary?.href}
				secondaryLabel={config.cta.secondary?.label}
			/>
		</div>
	);
}
