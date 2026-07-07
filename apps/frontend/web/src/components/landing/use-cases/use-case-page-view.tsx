"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import { accentStyles } from "@reloop/web/lib/landing/page-accents";
import type { LandingPageDefinition } from "@reloop/web/lib/landing/types";
import { getUseCaseEnrichment } from "@reloop/web/lib/landing/use-cases/enrichment";
import Link from "next/link";
import AiAgentWidget from "./widgets/ai-agent";
import AutomatedWidget from "./widgets/automated";
import EmailVerificationWidget from "./widgets/email-verification";
import InboundWidget from "./widgets/inbound";
import MarketingWidget from "./widgets/marketing";
import OrderConfirmationWidget from "./widgets/order-confirmation";
import PasswordResetWidget from "./widgets/password-reset";
import PaymentReceiptWidget from "./widgets/payment-receipt";
import SystemMonitoringWidget from "./widgets/system-monitoring";
import TransactionalWidget from "./widgets/transactional";
import WelcomeWidget from "./widgets/welcome";

function getUseCaseWidget(slug: string) {
	switch (slug) {
		case "transactional-email":
			return <TransactionalWidget />;
		case "marketing-email":
			return <MarketingWidget />;
		case "automated-email":
			return <AutomatedWidget />;
		case "ai-agent-inbox":
			return <AiAgentWidget />;
		case "inbound-email":
			return <InboundWidget />;
		case "system-monitoring-email":
			return <SystemMonitoringWidget />;
		case "password-reset-email":
			return <PasswordResetWidget />;
		case "welcome-email":
			return <WelcomeWidget />;
		case "order-confirmation-email":
			return <OrderConfirmationWidget />;
		case "email-verification":
			return <EmailVerificationWidget />;
		case "payment-receipt-email":
			return <PaymentReceiptWidget />;
		default:
			return null;
	}
}

export function UseCasePageView({ config }: { config: LandingPageDefinition }) {
	const extra = getUseCaseEnrichment(config.slug);
	const accent = accentStyles[extra.accent];
	const widget = getUseCaseWidget(config.slug);

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			{/* Product-style split hero (Stripe / SendGrid pattern) */}
			<div className="border-stroke-soft-200 border-b dark:border-white/10">
				<div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
					<div>
						<nav className="mb-4 flex gap-2 text-[13px] text-text-sub-600 dark:text-white/55">
							<Link href="/use-cases" className="hover:text-primary-base">
								Use cases
							</Link>
							<span>/</span>
							<span>{config.titleLines.join(" ")}</span>
						</nav>
						<span
							className={`inline-flex rounded-full px-3 py-1 font-semibold text-[11px] uppercase tracking-wider ${accent.badge}`}
						>
							Use case
						</span>
						<h1 className="mt-4 font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl dark:text-white">
							{config.titleLines.join(" ")}
						</h1>
						<p className="mt-4 text-[16px] text-text-sub-600 leading-relaxed dark:text-white/55">
							{config.description}
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							{config.primaryCta && (
								<Link
									href={config.primaryCta.href}
									className={Button.buttonVariants({ variant: "neutral" }).root(
										{
											className: "rounded-full",
										},
									)}
								>
									{config.primaryCta.label}
								</Link>
							)}
							{config.secondaryCta && (
								<Link
									href={config.secondaryCta.href}
									className={Button.buttonVariants({
										mode: "stroke",
										variant: "neutral",
									}).root({ className: "rounded-full" })}
								>
									{config.secondaryCta.label}
								</Link>
							)}
						</div>
						<div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-stroke-soft-200 px-4 py-3 dark:border-white/10">
							<span className={`font-bold text-2xl ${accent.text}`}>
								{extra.metric.value}
							</span>
							<span className="text-[13px] text-text-sub-600 dark:text-white/55">
								{extra.metric.label}
							</span>
						</div>
					</div>

					{widget ? (
						<div className="mx-auto h-full min-h-[420px] w-full max-w-xl">
							{widget}
						</div>
					) : (
						<div
							className={`overflow-hidden rounded-2xl bg-gradient-to-br ${accent.code} ring-1 ${accent.ring}`}
						>
							<div className="flex items-center gap-2 border-white/10 border-b px-4 py-3">
								<div className="size-2.5 rounded-full bg-red-400" />
								<div className="size-2.5 rounded-full bg-amber-400" />
								<div className="size-2.5 rounded-full bg-emerald-400" />
								<span className="ml-2 font-mono text-[11px] text-white/40">
									example.ts
								</span>
							</div>
							<pre className="overflow-x-auto p-5 font-mono text-[12px] text-emerald-300/90 leading-relaxed">
								{extra.code}
							</pre>
						</div>
					)}
				</div>
			</div>

			{/* Flow steps */}
			<div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
				<h2 className="font-semibold text-lg text-text-strong-950 dark:text-white">
					How it works
				</h2>
				<ol className="mt-8 grid gap-6 sm:grid-cols-3">
					{extra.flow.map((step, i) => (
						<li
							key={step}
							className="relative rounded-2xl border border-stroke-soft-200 p-6 dark:border-white/10"
						>
							<span
								className={`flex size-8 items-center justify-center rounded-full font-bold text-sm text-white ${accent.bg}`}
							>
								{i + 1}
							</span>
							<p className="mt-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
								{step}
							</p>
						</li>
					))}
				</ol>

				{config.sections[0] && (
					<div className="mt-14">
						<h2 className="font-semibold text-text-strong-950 text-xl dark:text-white">
							{config.sections[0].title}
						</h2>
						<div className="mt-6 grid gap-4 sm:grid-cols-3">
							{config.sections[0].items.map((item) => (
								<div
									key={item.title}
									className="rounded-xl bg-bg-weak-50 p-5 dark:bg-white/[0.03]"
								>
									<p className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
										{item.title}
									</p>
									<p className="mt-2 text-[13px] text-text-sub-600 dark:text-white/55">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{config.relatedLinks && config.relatedLinks.length > 0 && (
					<div className="mt-10 flex flex-wrap gap-2">
						{config.relatedLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="rounded-full border border-stroke-soft-200 px-4 py-2 text-[13px] hover:border-primary-base hover:text-primary-base dark:border-white/10"
							>
								{link.label} →
							</Link>
						))}
					</div>
				)}
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
