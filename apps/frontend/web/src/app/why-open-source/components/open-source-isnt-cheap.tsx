export function OpenSourceIsntCheap() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 py-14 sm:px-10 sm:py-16 md:max-w-7xl lg:px-12 dark:border-white/10">
				{/* Soft desk surface */}
				<div className="flex justify-center sm:justify-start">
					{/* Note card */}
					<div className="relative w-full max-w-xl">
						{/* Soft drop shadow layers */}
						<div
							aria-hidden
							className="absolute inset-2 translate-y-1 rounded-sm bg-black/[0.04] blur-[2px] dark:bg-black/40"
						/>

						<article
							className="relative rotate-[-0.6deg] rounded-sm border border-[#e8dfc8] bg-[#fff9e8] px-6 py-7 shadow-[0_12px_40px_-16px_rgba(40,30,10,0.28)] sm:rotate-[-1deg] sm:px-8 sm:py-9 dark:border-[#3a3428] dark:bg-[#1c1914] dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.65)]"
							style={{
								backgroundImage:
									"repeating-linear-gradient(transparent, transparent 27px, rgba(180,160,100,0.12) 28px)",
							}}
						>
							{/* Tape strip */}
							<div
								aria-hidden
								className="-top-3 absolute left-1/2 h-7 w-24 -translate-x-1/2 rotate-[-2deg] rounded-[2px] bg-[#f0e6c0]/90 shadow-sm dark:bg-[#4a4334]/90"
								style={{
									backgroundImage:
										"linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
								}}
							/>

							{/* Note label */}
							<p className="font-medium text-[11px] text-[#8a7a55] uppercase tracking-[0.16em] dark:text-[#a89870]">
								A note
							</p>

							{/* Ruled body */}
							<div className="mt-5 space-y-[1.15rem] text-[15px] text-[#3d3420] leading-[1.75] sm:text-[15.5px] dark:text-[#e8dfc8]/90">
								<p className="font-semibold text-[1.35rem] text-[#1f1a10] leading-snug tracking-tight sm:text-[1.5rem] dark:text-[#f5efdc]">
									Open source isn&apos;t cheap.
								</p>

								<p>You might think it is.</p>

								<p>
									If the code is public, why would anyone pay for it?
								</p>

								<p className="font-medium text-[#1f1a10] dark:text-[#f5efdc]">
									But look around.
								</p>

								<p>The internet runs on open source.</p>

								<ul className="list-none space-y-1.5 pl-0">
									<li>Google runs on it.</li>
									<li>Stripe runs on it.</li>
									<li>Startups run on it.</li>
									<li>Your favorite developer tools run on it.</li>
								</ul>

								<ul className="list-none space-y-1.5 border-[#e0d4b0] border-t pt-4 pl-0 dark:border-[#3a3428]">
									<li>
										Linux runs the world&apos;s infrastructure.
									</li>
									<li>PostgreSQL runs production databases.</li>
									<li>Kubernetes runs cloud infrastructure.</li>
									<li>React runs products used by millions.</li>
								</ul>

								<p className="border-[#e0d4b0] border-t pt-4 font-semibold text-[#1f1a10] dark:border-[#3a3428] dark:text-[#f5efdc]">
									Open source isn&apos;t the cheap alternative to
									software.
								</p>

								<p>It&apos;s the foundation modern software is built on.</p>

								<p>
									The question isn&apos;t whether open source is valuable.
								</p>

								<p className="font-semibold text-[#1f1a10] dark:text-[#f5efdc]">
									The question is why are we still treating email
									infrastructure differently?
								</p>

								<p className="pt-2 font-medium text-[#1f1a10] italic dark:text-[#f5efdc]">
									That&apos;s why we built Reloop.
								</p>
							</div>

							{/* Bottom margin scribble line */}
							<div
								aria-hidden
								className="mt-8 h-px w-16 bg-[#c4b48a]/80 dark:bg-[#6a5f48]"
							/>
						</article>
					</div>
				</div>
			</div>
		</section>
	);
}
