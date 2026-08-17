"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

const FAQS = [
	{
		q: "Why is Port 25 blocked on my VPS provider (AWS / DigitalOcean / Hetzner)?",
		a: "Most cloud providers block outbound TCP port 25 by default on new accounts to combat spam. You can request port 25 unblocking through their support portal or configure an upstream SMTP relay (like Reloop Cloud or Amazon SES) in your Reloop configuration.",
	},
	{
		q: "How do I set up Reverse DNS (PTR record) for self-hosting?",
		a: "PTR records must be configured in your VPS provider's control panel (not your domain DNS registrar). Point your server's public IP PTR record to your mail hostname (e.g. mail.yourdomain.com).",
	},
	{
		q: "How do database migrations and updates work?",
		a: "When you pull the latest Docker image and restart the container, Reloop automatically runs idempotent schema migrations on startup. Your data and settings are preserved.",
	},
	{
		q: "Can I use an external PostgreSQL and Redis instance (e.g. AWS RDS / Upstash)?",
		a: "Yes. Simply set DATABASE_URL and REDIS_URL environment variables to point to your managed cloud instances.",
	},
	{
		q: "Is there any telemetry or call-home mechanism?",
		a: "No. Reloop is 100% open source under Apache 2.0. There are no tracking scripts, telemetry pings, or license key checks.",
	},
];

export function SelfHostFaq() {
	const [openIdx, setOpenIdx] = useState<number | null>(0);

	return (
		<section className="border-stroke-soft-200 border-t py-16 sm:py-20 dark:border-white/10">
			<div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
				<div className="text-center">
					<h2 className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-4xl dark:text-white">
						Frequently Asked Questions
					</h2>
					<p className="mt-3 text-[14.5px] text-text-sub-600 sm:text-base dark:text-white/60">
						Everything you need to know about self-hosting email infrastructure.
					</p>
				</div>

				<div className="mt-10 space-y-4">
					{FAQS.map((faq, idx) => {
						const isOpen = openIdx === idx;
						return (
							<div
								key={faq.q}
								className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50/40 transition-colors dark:border-white/10 dark:bg-white/[0.02]"
							>
								<button
									type="button"
									onClick={() => setOpenIdx(isOpen ? null : idx)}
									className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-[15px] text-text-strong-950 transition-colors dark:text-white"
								>
									<span>{faq.q}</span>
									<Icon
										name="chevron-down"
										className={`size-4 shrink-0 text-text-sub-600 transition-transform duration-200 dark:text-white/50 ${
											isOpen ? "rotate-180" : ""
										}`}
									/>
								</button>
								{isOpen && (
									<div className="border-stroke-soft-200/60 border-t px-5 pt-3 pb-4 text-[14px] text-text-sub-600 leading-relaxed dark:border-white/10 dark:text-white/60">
										{faq.a}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
