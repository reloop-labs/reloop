"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useState } from "react";

const PROVIDERS = [
	{ name: "SendGrid", host: "smtp.sendgrid.net", user: "apikey" },
	{ name: "Resend", host: "smtp.resend.com", user: "resend" },
	{ name: "Mailgun", host: "smtp.mailgun.org", user: "postmaster@…" },
	{
		name: "Amazon SES",
		host: "email-smtp.us-east-1.amazonaws.com",
		user: "AKIA…",
	},
	{ name: "Postmark", host: "smtp.postmarkapp.com", user: "server-token" },
] as const;

const REASONS = [
	{
		icon: "dollar",
		title: "Free to start",
		body: "3,000 emails a month on the free plan. No credit card, no trial clock.",
	},
	{
		icon: "open-source",
		title: "Open source",
		body: "Read the code that sends your mail. Self-host it on your own servers whenever you want.",
	},
	{
		icon: "headset",
		title: "We'll help you move",
		body: "Book a call and we'll walk your team through the switch, DNS and all.",
	},
] as const;

export function SwitchSection() {
	const [index, setIndex] = useState(0);
	const provider = PROVIDERS[index] ?? PROVIDERS[0];

	return (
		<section
			id="switch"
			aria-labelledby="switch-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10">
				<div className="flex flex-col px-4 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
					<span className="inline-flex w-fit items-center gap-1.5 rounded-[10px] bg-blue-50 px-2.5 py-1 font-medium text-[13px] text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
						<Icon name="arrow-swap" className="size-3.5" />
						No lock-in
					</span>
					<h2
						id="switch-heading"
						className="mt-4 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.4rem] dark:text-white"
					>
						Switch in one config change.
					</h2>
					<p className="mt-3 max-w-lg text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
						Already sending over SMTP? Point your mailer at Reloop and keep the
						rest of your code exactly as it is.
					</p>

					<ul className="mt-8 space-y-5">
						{REASONS.map((r) => (
							<li key={r.title} className="flex gap-3.5">
								<span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-stroke-soft-200 text-text-strong-950 dark:border-white/10 dark:text-white">
									<Icon name={r.icon} className="size-4" />
								</span>
								<div>
									<p className="font-medium text-[15px] text-text-strong-950 dark:text-white">
										{r.title}
									</p>
									<p className="mt-0.5 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
										{r.body}
									</p>
								</div>
							</li>
						))}
					</ul>
				</div>

				<div className="flex flex-col justify-center px-4 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
					<div
						role="tablist"
						aria-label="Switch from"
						className="flex flex-wrap gap-1.5"
					>
						{PROVIDERS.map((p, i) => (
							<button
								key={p.name}
								type="button"
								role="tab"
								aria-selected={i === index}
								onClick={() => setIndex(i)}
								className={cn(
									"rounded-lg px-3 py-1.5 font-medium text-[13px] transition-colors",
									i === index
										? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
										: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white",
								)}
							>
								{p.name}
							</button>
						))}
					</div>

					<div className="mt-4 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50 font-mono text-[13px] leading-relaxed dark:border-white/10 dark:bg-white/[0.03]">
						<div className="border-stroke-soft-200 border-b px-4 py-2.5 text-[11.5px] text-text-soft-400 dark:border-white/10 dark:text-white/40">
							mailer.config
						</div>
						<pre className="overflow-x-auto px-4 py-4">
							<span className="block text-text-sub-600 dark:text-white/50">
								{"{"}
							</span>
							<span className="block bg-error-base/[0.08] text-error-base">
								{`-  host: '${provider.host}',`}
							</span>
							<span className="block bg-success-base/[0.08] text-success-base">
								{"+  host: 'smtp.reloop.sh',"}
							</span>
							<span className="block text-text-sub-600 dark:text-white/50">
								{"   port: 587,"}
							</span>
							<span className="block bg-error-base/[0.08] text-error-base">
								{`-  user: '${provider.user}',`}
							</span>
							<span className="block bg-success-base/[0.08] text-success-base">
								{"+  user: 'reloop',"}
							</span>
							<span className="block bg-success-base/[0.08] text-success-base">
								{"+  pass: process.env.RELOOP_API_KEY,"}
							</span>
							<span className="block text-text-sub-600 dark:text-white/50">
								{"}"}
							</span>
						</pre>
					</div>

					<div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
						<Link
							href="/docs/examples/smtp/introduction"
							className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
						>
							SMTP setup guide
							<Icon
								name="arrow-right"
								className="size-3 transition-transform group-hover:translate-x-0.5"
								aria-hidden
							/>
						</Link>
						<a
							href="https://cal.com/pranavp/30"
							target="_blank"
							rel="noreferrer"
							className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
						>
							Book a migration call
							<Icon
								name="arrow-right"
								className="size-3 transition-transform group-hover:translate-x-0.5"
								aria-hidden
							/>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
