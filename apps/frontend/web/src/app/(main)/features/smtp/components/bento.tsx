"use client";

import { Icon } from "@reloop/ui/icon";

const cardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 sm:border-t sm:border-l lg:border-t lg:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 lg:[&:nth-child(-n+3)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+2)]:border-l";

export default function Bento() {
	return (
		<section id="capabilities">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Core Infrastructure
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						SMTP relay &amp; HTTP APIs
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						Connect using standard protocols on a zero-latency, failover edge mesh network.
					</p>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
					<div className={`col-span-1 lg:col-span-2 ${cardClassName}`}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="arrow-swap"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Managed SMTP relay
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Point your existing mailers straight to Reloop. Zero-configuration migration from
								other SMTP providers with full TLS support.
							</p>
						</div>
						<div className="mt-12 grid grid-cols-2 gap-4">
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-4 dark:border-white/10">
								<div className="mb-1 font-mono text-text-soft-400 text-xs dark:text-white/40">
									SMTP HOST
								</div>
								<div className="font-mono font-semibold text-[13px] text-text-strong-950 dark:text-white">
									smtp.reloop.dev
								</div>
								<div className="mt-1 font-mono text-[11px] text-text-soft-400 dark:text-white/30">
									Ports: 587 (TLS), 465 (SSL)
								</div>
							</div>
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-4 dark:border-white/10">
								<div className="mb-1 font-mono text-text-soft-400 text-xs dark:text-white/40">
									HTTP ENDPOINT
								</div>
								<div className="font-mono font-semibold text-[13px] text-text-strong-950 dark:text-white">
									api.reloop.dev/v1
								</div>
								<div className="mt-1 font-mono text-[11px] text-text-soft-400 dark:text-white/30">
									HTTPS POST /send
								</div>
							</div>
						</div>
					</div>

					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="shield-check"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								TLS &amp; authentication
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Enforce encrypted transport and API-key or SMTP credential auth. Rotate keys without downtime.
							</p>
						</div>
					</div>

					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="globe"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Global edge network
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								14 relay regions route mail closer to recipients for faster handoffs and better deliverability.
							</p>
						</div>
						<div className="mt-12">
							<div className="font-bold text-3xl text-primary-base tracking-tight">
								14 regions
							</div>
							<div className="mt-1 text-[11px] text-text-soft-400 dark:text-white/40">
								Active SMTP relay endpoints
							</div>
						</div>
					</div>

					<div className={`col-span-1 lg:col-span-2 ${cardClassName}`}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="webhook"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Delivery event webhooks
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Receive real-time callbacks for delivered, bounced, and deferred events. Debug SMTP
								handshakes with full message traces.
							</p>
						</div>
						<div className="mt-12 space-y-1 rounded-xl bg-[#0a0a0a] p-4 font-mono text-[11px] shadow-inner">
							<div className="mb-2 flex justify-between border-white/5 border-b pb-2 text-white/30">
								<span>SMTP TRACE</span>
								<span className="text-primary-base">250 OK</span>
							</div>
							<div className="text-white/50">
								&gt; EHLO client.example.com
							</div>
							<div className="text-white/50">
								&gt; MAIL FROM:&lt;noreply@yourdomain.com&gt;
							</div>
							<div className="text-emerald-400">
								&gt; Queued · delivered in 11ms
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
