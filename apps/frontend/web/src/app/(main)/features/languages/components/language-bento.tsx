import { Icon } from "@reloop/ui/icon";
import type { LanguageDefinition } from "../languages";

const cardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 sm:border-t sm:border-l lg:border-t lg:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 lg:[&:nth-child(-n+3)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+2)]:border-l";

export default function LanguageBento({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<section id="capabilities">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Built for {language.name} developers
					</h2>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
					<div className={`col-span-1 lg:col-span-2 ${cardClassName}`}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="code"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Idiomatic {language.name} client
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Follows conventions your team already uses—clear types,
								predictable errors, and examples that match the official
								quickstart.
							</p>
						</div>
						<div className="mt-8 flex flex-wrap gap-2">
							{language.highlights.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-stroke-soft-200 bg-bg-soft-50 px-2.5 py-1 font-semibold text-[11px] text-primary-base dark:border-white/10"
								>
									{tag}
								</span>
							))}
						</div>
					</div>

					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="send-2"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Fast delivery
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Messages route through Reloop's edge network for sub-second
								handoffs and high inbox placement.
							</p>
						</div>
					</div>

					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="webhook"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Events & webhooks
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Track delivered, bounced, and opened events from your{" "}
								{language.name} app with signed webhook payloads.
							</p>
						</div>
					</div>

					<div className={`col-span-1 lg:col-span-2 ${cardClassName}`}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="shield-check"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Production ready
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								API keys, domain verification, rate limits, and
								observability—everything you need before going live.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
