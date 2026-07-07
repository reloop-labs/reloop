"use client";

import { Icon } from "@reloop/ui/icon";

const cardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 sm:border-t sm:border-l lg:border-t lg:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 lg:[&:nth-child(-n+3)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+2)]:border-l";

export default function Features() {
	return (
		<section id="features">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Built for every mailer
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Reloop SMTP relay works with the tools you already run—no SDK swap,
						no proprietary API lock-in.
					</p>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="code"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								No SDK required
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Point Nodemailer, PHPMailer, Django, Rails, or any SMTP client at
								Reloop. Same host, port, and credentials everywhere.
							</p>
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
								STARTTLS & TLS ports
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Port 587 with STARTTLS for most apps, plus 2465 and 2587 for
								direct TLS. Pick what your mailer supports.
							</p>
						</div>
						<div className="mt-12 flex flex-wrap gap-2">
							<span className="rounded-full border border-stroke-soft-200 bg-bg-soft-50 px-2.5 py-1 font-mono font-semibold text-[11px] text-primary-base dark:border-white/10">
								587 STARTTLS
							</span>
							<span className="rounded-full border border-stroke-soft-200 bg-bg-soft-50 px-2.5 py-1 font-mono font-semibold text-[11px] text-primary-base dark:border-white/10">
								2465 TLS
							</span>
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
								Analytics included
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Every SMTP send counts toward the same quota and shows up in
								Reloop analytics—opens, clicks, bounces, and delivery status.
							</p>
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
								Same stack as the API
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								SMTP relay shares Reloop's delivery infrastructure with the REST
								API—webhooks, templates, domains, and deliverability tools all
								apply to SMTP sends.
							</p>
						</div>

						<ul className="mt-12 space-y-3">
							{[
								"Transactional & campaign email",
								"Custom domains & DKIM signing",
								"Webhook events on delivery",
							].map((feature) => (
								<li
									key={feature}
									className="flex items-start gap-3 text-[14px] leading-snug"
								>
									<Icon
										name="check-circle"
										className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/35"
									/>
									<span className="text-text-sub-600 dark:text-white/60">
										{feature}
									</span>
								</li>
							))}
						</ul>
					</div>

					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="tag"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Free to start
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								3,000 emails per month on the Free plan. No credit card
								required—upgrade when your volume grows.
							</p>
						</div>
						<div className="mt-12">
							<div className="font-serif text-[2.4rem] text-text-strong-950 leading-none tracking-tighter dark:text-white">
								$0
							</div>
							<p className="mt-2 text-[14px] text-text-sub-600 dark:text-white/45">
								3,000 emails / month
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
