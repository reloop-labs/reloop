"use client";

const stepCardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 md:border-t md:border-l md:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] md:[&:nth-child(-n+3)]:border-t-0 md:[&:nth-child(3n+1)]:border-l-0";

export default function Guide() {
	return (
		<section
			id="guide"
			className="bg-[#f8f8f8] text-text-strong-950 dark:bg-black dark:text-white"
		>
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Get Started
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Setup in 3 Steps
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						No complex integration pipelines. Connect your agent frameworks in minutes.
					</p>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 md:grid-cols-3 dark:border-white/10">
					<div className={stepCardClassName}>
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								1
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								Configure Mailbox
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Create a dedicated agent inbox address (e.g. agent@yourdomain.com) and supply the validation JSON schemas.
							</p>
						</div>
					</div>

					<div className={stepCardClassName}>
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								2
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								Import SDK Code
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Install the official Reloop Client SDK package for your language:
								<code className="mt-4 block rounded border border-white/5 bg-[#0a0a0a] p-2 font-mono text-[11.5px] text-primary-base">
									npm install @reloop/sdk
								</code>
							</p>
						</div>
					</div>

					<div className={stepCardClassName}>
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								3
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								Bind Callbacks
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Receive clean parsed JSON callbacks on incoming emails, let your agents process requests, and reply back programmatically.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
