"use client";

import { Icon } from "@reloop/ui/icon";

export default function Bento() {
	return (
		<section className="border-[#0a0d12]/5 border-t bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="mb-20 text-center">
					<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
						Core Capabilities
					</p>
					<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						AI-Native Email Architecture
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[#0a0d12]/50 text-base">
						Stop parsing messy, unstructured MIME content. Supply standard JSON
						schemas, and let Reloop handle validation and delivery.
					</p>
				</div>

				<div className="grid gap-px overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-[#0a0d12]/8 sm:grid-cols-2 lg:grid-cols-3">
					{/* Card 1: JSON Schema Calling */}
					<div className="col-span-1 flex flex-col justify-between bg-white p-8 transition-colors hover:bg-zinc-50/50 lg:col-span-2 lg:p-10">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4">
								<Icon name="arrow-swap" className="size-5 text-[#0a0d12]/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px]">
								Structured Schema Validation
							</h3>
							<p className="max-w-md text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Map inbound messages to structured JSON objects instantly. Define
								required properties, types, and constraints to filter and clean data
								for LLM function calls.
							</p>
						</div>

						<div className="mt-12 grid grid-cols-2 gap-4">
							<div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
								<div className="mb-1 font-mono text-[#0a0d12]/40 text-xs">
									INBOUND FORMAT
								</div>
								<div className="font-mono font-semibold text-[#0a0d12] text-[13px]">
									MIME / Multipart
								</div>
								<div className="mt-1 font-mono text-[#0a0d12]/30 text-[11px]">
									Encrypted attachments, headers
								</div>
							</div>
							<div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
								<div className="mb-1 font-mono text-[#0a0d12]/40 text-xs">
									OUTBOUND TO AGENT
								</div>
								<div className="font-mono font-semibold text-[#0a0d12] text-[13px]">
									Type-Safe JSON Schema
								</div>
								<div className="mt-1 font-mono text-[#0a0d12]/30 text-[11px]">
									Pre-parsed & clean fields
								</div>
							</div>
						</div>
					</div>

					{/* Card 2: Thread Context Sync */}
					<div className="flex flex-col justify-between bg-white p-8 transition-colors hover:bg-zinc-50/50 lg:p-10">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4">
								<Icon name="graph-up" className="size-5 text-[#0a0d12]/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px]">
								Thread Context Sync
							</h3>
							<p className="text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Maintain autonomous agent memory. Automatically associate replies with
								parent threads so your LLMs always have the full conversation context.
							</p>
						</div>
						<div className="mt-12 flex items-end justify-between">
							<div>
								<div className="font-bold text-3xl text-[#0a0d12] tracking-tight">
									&lt;15ms
								</div>
								<div className="mt-1 text-[#0a0d12]/40 text-[11px]">
									Average Context Stitching
								</div>
							</div>
							{/* Mini Sparkline */}
							<svg
								className="h-8 w-20 text-purple-500"
								viewBox="0 0 100 30"
								fill="none"
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

					{/* Card 3: AI-Native Guardrails */}
					<div className="flex flex-col justify-between bg-white p-8 transition-colors hover:bg-zinc-50/50 lg:p-10">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4">
								<Icon name="lock" className="size-5 text-[#0a0d12]/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px]">
								AI-Native Guardrails
							</h3>
							<p className="text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Filter prompt injection vectors hiding inside incoming email bodies. Ensure outbound agent drafts are sanitized, legal, and hallucination-free.
							</p>
						</div>
						<div className="mt-12 flex flex-wrap gap-2">
							<span className="rounded-full border border-purple-100 bg-purple-50 px-2.5 py-1 font-semibold text-[11px] text-purple-600">
								Injection Block Pass
							</span>
							<span className="rounded-full border border-purple-100 bg-purple-50 px-2.5 py-1 font-semibold text-[11px] text-purple-600">
								Outbound Sanity Pass
							</span>
						</div>
					</div>

					{/* Card 4: Webhook Pipelines */}
					<div className="col-span-1 flex flex-col justify-between bg-white p-8 transition-colors hover:bg-zinc-50/50 lg:col-span-2 lg:p-10">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4">
								<Icon name="webhook" className="size-5 text-[#0a0d12]/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px]">
								Asynchronous Agent Webhooks
							</h3>
							<p className="max-w-md text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Automatically route parsed inbox messages straight to your agent's API endpoint. Perfect for LangChain, AutoGen, and custom LLM servers.
							</p>
						</div>

						<div className="mt-12 space-y-1 rounded-xl bg-[#0a0a0a] p-4 font-mono text-[11px] shadow-inner">
							<div className="mb-2 flex justify-between border-white/5 border-b pb-2 text-white/30">
								<span>AGENT WEBHOOK CALLBACK</span>
								<span className="text-purple-400">WAITING</span>
							</div>
							<div className="flex justify-between text-purple-400">
								<span>POST https://api.yourdomain.com/agents/callback</span>
								<span className="text-emerald-400">200 OK</span>
							</div>
							<div className="text-white/40">
								&#123; "status": "processed", "replied": true, "tokens_used": 420 &#125;
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
