import Link from "next/link";

const benefits = [
	{
		number: "01",
		title: "Complete Transparency",
		description:
			"Every line of code is visible. You know exactly how your email infrastructure works — no hidden algorithms, no black boxes, no surprises.",
	},
	{
		number: "02",
		title: "No Vendor Lock-in",
		description:
			"You own your infrastructure. Self-host on your servers, modify the code, or migrate whenever you want. Your data stays yours — always.",
	},
	{
		number: "03",
		title: "Security Through Visibility",
		description:
			"Open source means thousands of engineers reviewing the code. Vulnerabilities are found and patched faster than in any proprietary system.",
	},
	{
		number: "04",
		title: "Community Innovation",
		description:
			"Features, fixes, and integrations contributed by real developers solving real problems. Innovation happens faster when we build together.",
	},
	{
		number: "05",
		title: "Runs Anywhere",
		description:
			"Docker Compose, Kubernetes, bare metal, or a single binary. Your infrastructure, your rules — no calls home, no telemetry you didn't opt into.",
	},
	{
		number: "06",
		title: "Accessible to Everyone",
		description:
			"A solo founder, a Y Combinator startup, or a Fortune 500 engineering team — open source removes the barriers that proprietary pricing creates.",
	},
];

const contrast = [
	{
		label: "Proprietary providers",
		points: [
			"Opaque pricing that grows with you",
			"Black-box deliverability decisions",
			"Locked into their roadmap",
			"Data leaves your control",
			"Support tickets instead of source code",
		],
		dark: true,
	},
	{
		label: "Reloop open source",
		points: [
			"Predictable, self-hosted or cloud pricing",
			"Every routing decision is auditable",
			"Contribute to the roadmap directly",
			"Data stays in your network",
			"Read the code, fix the bug, ship the PR",
		],
		dark: false,
	},
];

const WhyOpenSourcePage = () => {
	return (
		<div>
			{/* ── Hero ─────────────────────────────────────────── */}
			<section className="bg-white text-[#0a0d12]">
				<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
					<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
						Philosophy
					</p>
					<h1 className="mt-4 max-w-[860px] font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.8rem]">
						Why chose open source.
					</h1>
					<p className="mt-8 max-w-[580px] text-[#0a0d12]/60 text-[15px] leading-relaxed sm:text-[17px]">
						Transparency, security, and community-driven innovation aren't
						marketing words — they're the exact reasons we made Reloop fully
						open source from day one.
					</p>
					<div className="mt-10 flex flex-wrap items-center gap-4">
						<a
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90"
						>
							View on GitHub
						</a>
						<Link
							href="/resources/self-hosting-guide"
							className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/6"
						>
							Self-hosting guide
						</Link>
					</div>
				</div>
			</section>

			{/* ── The Six Reasons ──────────────────────────────── */}
			<section className="bg-[#05070b] text-white">
				<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
					<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
						{/* Left */}
						<div className="lg:w-[340px] lg:shrink-0">
							<p className="font-semibold text-[11px] text-white/40 uppercase tracking-[0.16em]">
								The open source advantage
							</p>
							<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem]">
								Six reasons
								<br />
								<span className="text-primary-base">that matter.</span>
							</h2>
							<p className="mt-6 text-[15px] text-white/50 leading-7">
								Open source isn't a development model — it's a philosophy that
								produces better software, builds deeper trust, and creates
								stronger communities.
							</p>
						</div>

						{/* Right grid */}
						<div className="flex-1">
							<div className="grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2">
								{benefits.map((b) => (
									<div
										key={b.number}
										className="flex flex-col bg-[#05070b] p-8 lg:p-10"
									>
										<span className="font-semibold text-sm text-white/28 tabular-nums">
											{b.number}
										</span>
										<h3 className="mt-4 font-semibold text-lg text-white leading-snug">
											{b.title}
										</h3>
										<p className="mt-3 text-[15px] text-white/50 leading-relaxed">
											{b.description}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Contrast Section ─────────────────────────────── */}
			<section className="bg-white text-[#0a0d12]">
				<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
					<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
						The difference
					</p>
					<h2 className="mt-4 max-w-[640px] font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem]">
						Closed source asks you to trust.
						<br />
						<span className="text-primary-base">
							Open source lets you verify.
						</span>
					</h2>

					<div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-[#0a0d12]/8 sm:grid-cols-2">
						{/* Proprietary column */}
						<div className="bg-[#0a0d12] p-8 text-white lg:p-12">
							<p className="font-semibold text-[11px] text-white/40 uppercase tracking-[0.16em]">
								Proprietary providers
							</p>
							<ul className="mt-8 space-y-5">
								{contrast[0]?.points.map((pt) => (
									<li
										key={pt}
										className="flex items-start gap-3 text-[15px] text-white/60"
									>
										<span className="mt-[3px] shrink-0 font-semibold text-white/24">
											✕
										</span>
										{pt}
									</li>
								))}
							</ul>
						</div>

						{/* Reloop column */}
						<div className="bg-white p-8 lg:p-12">
							<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
								Reloop open source
							</p>
							<ul className="mt-8 space-y-5">
								{contrast[1]?.points.map((pt) => (
									<li
										key={pt}
										className="flex items-start gap-3 text-[#0a0d12]/70 text-[15px]"
									>
										<span className="mt-[3px] shrink-0 font-semibold text-emerald-500">
											✓
										</span>
										{pt}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* ── Community Numbers ────────────────────────────── */}
			<section className="bg-[#05070b] text-white">
				<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
					<p className="font-semibold text-[11px] text-white/40 uppercase tracking-[0.16em]">
						Built in public
					</p>
					<h2 className="mt-4 max-w-[640px] font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem]">
						By the community,
						<br />
						<span className="text-primary-base">for the community.</span>
					</h2>

					<div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-3">
						{[
							{
								stat: "1,000+",
								label: "GitHub Stars",
								sub: "And growing every day",
							},
							{
								stat: "50+",
								label: "Contributors",
								sub: "From around the world",
							},
							{
								stat: "100%",
								label: "Open source",
								sub: "Apache 2.0 licensed",
							},
						].map((item) => (
							<div
								key={item.label}
								className="flex flex-col bg-[#05070b] p-8 lg:p-12"
							>
								<span className="font-semibold text-[3rem] text-white leading-none tracking-tighter sm:text-[3.6rem]">
									{item.stat}
								</span>
								<span className="mt-4 font-semibold text-[17px] text-white">
									{item.label}
								</span>
								<span className="mt-2 text-[14px] text-white/40">
									{item.sub}
								</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ──────────────────────────────────────────── */}
			<section className="bg-white text-[#0a0d12]">
				<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
					<div className="mx-auto max-w-[920px] text-center">
						<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
							Join the movement
						</p>
						<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
							Read the code.
							<br />
							<span className="text-primary-base">Own your stack.</span>
						</h2>
						<p className="mx-auto mt-8 max-w-[560px] text-[#0a0d12]/60 text-[15px] leading-7 sm:text-[17px]">
							Contribute to Reloop, deploy your own instance, or star us on
							GitHub to show your support for open source email infrastructure.
						</p>
						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<a
								href="https://github.com/reloop-labs/reloop"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90"
							>
								⭐ Star on GitHub
							</a>
							<Link
								href="/resources/self-hosting-guide"
								className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/6"
							>
								Start self-hosting
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default WhyOpenSourcePage;
