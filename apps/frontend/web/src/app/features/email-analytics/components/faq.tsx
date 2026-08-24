"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

const FAQS = [
	{
		q: "How does Reloop track opens without hurting deliverability?",
		a: "Reloop embeds a lightweight, transparent 1x1 tracking pixel signed uniquely for each recipient. We use edge-accelerated CDN endpoints with valid SSL certificates, avoiding common spam trigger patterns and ensuring instantaneous rendering.",
	},
	{
		q: "How are Apple Mail Privacy Protection (MPP) opens handled?",
		a: "Apple MPP proxies pre-fetch images in emails, which inflates open counts on legacy providers. Reloop's analytics engine isolates proxy user-agents and IP ranges, providing you with a clean split between verified human opens and machine pre-fetches.",
	},
	{
		q: "Can I stream analytics events directly into my own data warehouse?",
		a: "Yes. Reloop supports continuous streaming to Snowflake, Google BigQuery, ClickHouse, and AWS S3 via native Webhook destinations or message bus integrations (Kafka / SQS).",
	},
	{
		q: "Are click tracking links branded to my domain?",
		a: "Yes. With custom CNAME tracking domains (e.g. click.yourdomain.com), all links are wrapped using your brand's domain and secured with automatic SSL certificates, preserving domain reputation.",
	},
	{
		q: "Is email analytics data GDPR and HIPAA compliant?",
		a: "Yes. Reloop allows full control over IP masking, PII retention windows, and unsubscribe management. You can configure data retention policies or self-host Reloop on your own infrastructure.",
	},
];

export default function FAQ() {
	const [openIdx, setOpenIdx] = useState<number | null>(0);

	return (
		<section className="relative w-full border-stroke-soft-200 border-t py-16 sm:py-24 dark:border-white/10">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<h2 className="font-serif text-[2.4rem] text-text-strong-950 leading-[1.08] tracking-tight sm:text-[3rem] dark:text-white">
						Frequently Asked Questions
					</h2>
					<p className="mx-auto mt-3 max-w-xl text-[15px] text-text-sub-600 dark:text-white/50">
						Everything you need to know about Reloop email analytics and
						deliverability monitoring.
					</p>
				</div>

				<div className="mt-12 space-y-4">
					{FAQS.map((faq, idx) => {
						const isOpen = openIdx === idx;
						return (
							<div
								key={faq.q}
								className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 transition-colors dark:border-white/10 dark:bg-white/[0.02]"
							>
								<button
									type="button"
									onClick={() => setOpenIdx(isOpen ? null : idx)}
									className="flex w-full items-center justify-between p-5 text-left font-medium text-[15px] text-text-strong-950 transition-colors sm:p-6 dark:text-white"
								>
									<span>{faq.q}</span>
									<Icon
										name="chevron-down"
										className={`size-4 shrink-0 transition-transform duration-200 ${
											isOpen ? "rotate-180" : ""
										}`}
									/>
								</button>
								{isOpen && (
									<div className="border-stroke-soft-200 border-t px-5 pt-3 pb-5 text-[14px] text-text-sub-600 leading-relaxed sm:px-6 sm:pb-6 dark:border-white/10 dark:text-white/60">
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
