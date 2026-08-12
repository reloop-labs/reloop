import type { LanguageDefinition } from "../languages";

export default function LanguageBento({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<section id="capabilities" className="w-full py-16 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-2">
					<p className="font-mono text-xs text-text-sub-600 uppercase tracking-wider dark:text-white/50">
						Runtime Architecture • {language.name}
					</p>
					<h2 className="font-sans font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
						Engineered natively for {language.name}
					</h2>
					<p className="max-w-2xl text-base text-text-sub-600 leading-relaxed dark:text-white/60">
						Designed from the ground up for high concurrency, zero memory leaks, and seamless developer experience in production.
					</p>
				</div>

				<div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-stroke-soft-200 bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10 dark:bg-white/10">
					{/* Card 1 (Span 2) */}
					<div className="flex flex-col justify-between bg-bg-white-0 p-6 sm:col-span-2 dark:bg-bg-black-950">
						<div>
							<span className="font-mono text-xs text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Idiomatic Design
							</span>
							<h3 className="mt-2 font-semibold text-lg text-text-strong-950 dark:text-white">
								Native {language.name} Client Patterns
							</h3>
							<p className="mt-2 max-w-lg text-xs text-text-sub-600 leading-relaxed dark:text-white/60">
								Respects established conventions—predictable exception classes, strict typing, and full support for {language.primaryFramework}.
							</p>
						</div>
						<div className="mt-6 flex flex-wrap gap-1.5">
							{language.highlights.map((tag) => (
								<span
									key={tag}
									className="rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 font-mono text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
								>
									{tag}
								</span>
							))}
						</div>
					</div>

					{/* Card 2 */}
					<div className="flex flex-col justify-between bg-bg-white-0 p-6 dark:bg-bg-black-950">
						<div>
							<span className="font-mono text-xs text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Performance
							</span>
							<h3 className="mt-2 font-semibold text-lg text-text-strong-950 dark:text-white">
								Sub-50ms Handoff
							</h3>
							<p className="mt-2 text-xs text-text-sub-600 leading-relaxed dark:text-white/60">
								HTTP requests route directly through Reloop edge proxies using persistent connection pools.
							</p>
						</div>
						<div className="mt-6 border-stroke-soft-200 border-t pt-3 dark:border-white/10">
							<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/50">
								Concurrency: {language.concurrency}
							</span>
						</div>
					</div>

					{/* Card 3 */}
					<div className="flex flex-col justify-between bg-bg-white-0 p-6 dark:bg-bg-black-950">
						<div>
							<span className="font-mono text-xs text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Webhooks
							</span>
							<h3 className="mt-2 font-semibold text-lg text-text-strong-950 dark:text-white">
								Signed Event Payloads
							</h3>
							<p className="mt-2 text-xs text-text-sub-600 leading-relaxed dark:text-white/60">
								Cryptographically verify incoming delivery, bounce, and open webhooks inside your {language.name} handlers.
							</p>
						</div>
						<div className="mt-6 border-stroke-soft-200 border-t pt-3 dark:border-white/10">
							<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/50">
								HMAC-SHA256 Verification
							</span>
						</div>
					</div>

					{/* Card 4 (Span 2) */}
					<div className="flex flex-col justify-between bg-bg-white-0 p-6 sm:col-span-2 dark:bg-bg-black-950">
						<div>
							<span className="font-mono text-xs text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Reliability
							</span>
							<h3 className="mt-2 font-semibold text-lg text-text-strong-950 dark:text-white">
								Production Security &amp; Observability
							</h3>
							<p className="mt-2 max-w-lg text-xs text-text-sub-600 leading-relaxed dark:text-white/60">
								Includes domain verification helpers, rate-limit state inspections, request IDs, and structured logging hooks.
							</p>
						</div>
						<div className="mt-6 flex items-center gap-4 border-stroke-soft-200 border-t pt-3 dark:border-white/10">
							<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/50">
								SOC 2 Type II
							</span>
							<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/50">
								99.99% Uptime SLA
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
