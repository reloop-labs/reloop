"use client";

import { Icon } from "@reloop/ui/icon";

const cardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 sm:border-t sm:border-l lg:border-t lg:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 lg:[&:nth-child(-n+3)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+2)]:border-l";

const categories = [
	"Newsletters",
	"E-commerce",
	"Transactional",
	"Marketing",
	"Welcome series",
	"Custom HTML",
];

export default function Bento() {
	return (
		<section id="capabilities">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Core Capabilities
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Templates for every need
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						From newsletters to password resets—curated designs you can ship in minutes.
					</p>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
					<div className={`col-span-1 lg:col-span-2 ${cardClassName}`}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon name="brush" className="size-5 text-text-sub-600 dark:text-white/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Curated template library
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Professional layouts for every use case. Duplicate, customize, and publish without starting from a blank page.
							</p>
						</div>
						<div className="mt-12 flex flex-wrap gap-2">
							{categories.map((cat) => (
								<span
									key={cat}
									className="rounded-full border border-stroke-soft-200 bg-bg-soft-50 px-2.5 py-1 font-semibold text-[11px] text-text-sub-600 dark:border-white/10 dark:text-white/70"
								>
									{cat}
								</span>
							))}
						</div>
					</div>

					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon name="edit" className="size-5 text-text-sub-600 dark:text-white/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Drag & drop editor
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Add text, images, buttons, and dividers visually. No HTML required for day-to-day edits.
							</p>
						</div>
					</div>

					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon name="code" className="size-5 text-text-sub-600 dark:text-white/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Dynamic variables
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Inject user names, order IDs, and custom fields at send time from your API or campaign payload.
							</p>
						</div>
					</div>

					<div className={`col-span-1 lg:col-span-2 ${cardClassName}`}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon name="brush" className="size-5 text-text-sub-600 dark:text-white/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Brand customization
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Save brand presets—colors, fonts, logos—and apply them across every template in your workspace.
							</p>
						</div>
						<div className="mt-12 space-y-1 rounded-xl bg-[#0a0a0a] p-4 font-mono text-[11px] shadow-inner">
							<div className="text-white/30">TEMPLATE RENDER</div>
							<div className="text-primary-base">
								{"{{ user.firstName }}"}, your order is confirmed
							</div>
							<div className="text-white/40">
								Order #{"{{ order.id }}"} · {"{{ order.total }}"}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
