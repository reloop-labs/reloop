"use client";

import { Icon } from "@reloop/ui/icon";

const cardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 sm:border-t sm:border-l lg:border-t lg:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 lg:[&:nth-child(-n+3)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+2)]:border-l";

export default function Bento() {
	return (
		<section id="capabilities">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						AI-Native Email Architecture
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						Stop parsing messy, unstructured MIME content. Supply standard JSON
						schemas, and let Reloop handle validation and delivery.
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
								Structured Schema Validation
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Map inbound messages to structured JSON objects instantly.
								Define required properties, types, and constraints to filter and
								clean data for LLM function calls.
							</p>
						</div>

						<div className="mt-12 grid grid-cols-2 gap-4">
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-4 dark:border-white/10">
								<div className="mb-1 font-mono text-text-soft-400 text-xs dark:text-white/40">
									INBOUND FORMAT
								</div>
								<div className="font-mono font-semibold text-[13px] text-text-strong-950 dark:text-white">
									MIME / Multipart
								</div>
								<div className="mt-1 font-mono text-[11px] text-text-soft-400 dark:text-white/30">
									Encrypted attachments, headers
								</div>
							</div>
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-4 dark:border-white/10">
								<div className="mb-1 font-mono text-text-soft-400 text-xs dark:text-white/40">
									OUTBOUND TO AGENT
								</div>
								<div className="font-mono font-semibold text-[13px] text-text-strong-950 dark:text-white">
									Type-Safe JSON Schema
								</div>
								<div className="mt-1 font-mono text-[11px] text-text-soft-400 dark:text-white/30">
									Pre-parsed & clean fields
								</div>
							</div>
						</div>
					</div>

					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="graph-up"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Thread Context Sync
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Maintain autonomous agent memory. Automatically associate
								replies with parent threads so your LLMs always have the full
								conversation context.
							</p>
						</div>
						<div className="mt-12 flex items-end justify-between">
							<div>
								<div className="font-bold text-3xl text-primary-base tracking-tight">
									&lt;15ms
								</div>
								<div className="mt-1 text-[11px] text-text-soft-400 dark:text-white/40">
									Average Context Stitching
								</div>
							</div>
							<svg
								className="h-8 w-20 text-primary-base"
								viewBox="0 0 100 30"
								fill="none"
								aria-hidden
							>
								<path
									d="M0 25 L15 24 L30 18 L45 20 L60 12 L75 14 L90 3 L100 5"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
					</div>

					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="lock"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								AI-Native Guardrails
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Filter prompt injection vectors hiding inside incoming email
								bodies. Ensure outbound agent drafts are sanitized, legal, and
								hallucination-free.
							</p>
						</div>
						<div className="mt-12 flex flex-wrap gap-2">
							<span className="rounded-full border border-stroke-soft-200 bg-bg-soft-50 px-2.5 py-1 font-semibold text-[11px] text-primary-base dark:border-white/10">
								Injection Block Pass
							</span>
							<span className="rounded-full border border-stroke-soft-200 bg-bg-soft-50 px-2.5 py-1 font-semibold text-[11px] text-primary-base dark:border-white/10">
								Outbound Sanity Pass
							</span>
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
								Asynchronous Agent Webhooks
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Automatically route parsed inbox messages straight to your
								agent's API endpoint. Perfect for LangChain, AutoGen, and custom
								LLM servers.
							</p>
						</div>

						<div className="mt-12 space-y-1 rounded-xl bg-[#0a0a0a] p-4 font-mono text-[11px] shadow-inner">
							<div className="mb-2 flex justify-between border-white/5 border-b pb-2 text-white/30">
								<span>AGENT WEBHOOK CALLBACK</span>
								<span className="text-primary-base">WAITING</span>
							</div>
							<div className="flex justify-between text-primary-base">
								<span>POST https://api.yourdomain.com/agents/callback</span>
								<span className="text-emerald-400">200 OK</span>
							</div>
							<div className="text-white/40">
								&#123; "status": "processed", "replied": true, "tokens_used":
								420 &#125;
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
