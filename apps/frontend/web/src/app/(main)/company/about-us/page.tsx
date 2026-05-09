import Link from "next/link";

const pillars = [
	{
		number: "01",
		title: "Radical Simplicity",
		description:
			"Email infrastructure that just works. No convoluted setup, no hidden complexity — one API, one SDK, one source of truth.",
	},
	{
		number: "02",
		title: "Open by Default",
		description:
			"Every line of code is public. Audit it, fork it, self-host it. We believe transparency builds better software and deeper trust.",
	},
	{
		number: "03",
		title: "Built for Scale",
		description:
			"From a weekend side-project to millions of emails a month. Reloop grows with you without changing its interface.",
	},
	{
		number: "04",
		title: "Developer-First",
		description:
			"Type-safe SDKs, clear error messages, predictable APIs. We sweat the details so you can focus on shipping.",
	},
	{
		number: "05",
		title: "AI-Ready",
		description:
			"Dedicated agent inboxes, structured parsing, and webhook hooks built for the agentic era — not bolted on as an afterthought.",
	},
	{
		number: "06",
		title: "Community-Driven",
		description:
			"Shaped by real feedback from real teams. Open issues, open roadmap, open conversation — always.",
	},
];

const timeline = [
	{
		year: "2024",
		event: "Founded",
		detail:
			"A small team of engineers, tired of fighting unreliable email vendors, started Reloop in a single weekend.",
	},
	{
		year: "2024",
		event: "Open Sourced",
		detail:
			"Reloop went fully public on GitHub. The community immediately started contributing drivers, fixes, and ideas.",
	},
	{
		year: "2025",
		event: "Agent Inbox",
		detail:
			"Launched the first AI-native email inbox — letting autonomous agents read, draft, and reply to email like a human.",
	},
	{
		year: "Now",
		event: "Growing",
		detail:
			"Thousands of AI agents and developers send and receive email on Reloop every day. The best is still ahead.",
	},
];

const AboutUsPage = () => {
	return (
		<div>
			{/* ── Hero ─────────────────────────────────────────── */}
			<section className="bg-white text-[#0a0d12]">
				<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
					<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
						Our company
					</p>
					<h1 className="mt-4 max-w-[820px] font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.8rem]">
						Email infrastructure{" "}
						<span className="text-[#0a0d12]/30">
							that gets out of your way.
						</span>
					</h1>
					<p className="mt-8 max-w-[560px] text-[#0a0d12]/60 text-[15px] leading-relaxed sm:text-[17px]">
						Reloop is an open-source email platform built by
						developers who were fed up with every alternative. Simple
						to integrate, transparent by design, ready for the
						agentic era.
					</p>
					<div className="mt-10 flex flex-wrap items-center gap-4">
						<Link
							href="/careers"
							className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90"
						>
							Join our team
						</Link>
						<a
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/6"
						>
							View on GitHub
						</a>
					</div>
				</div>
			</section>

			{/* ── What We Stand For ─────────────────────────────── */}
			<section className="bg-white text-[#0a0d12]">
				<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
					<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
						{/* Left label */}
						<div className="lg:w-[340px] lg:shrink-0">
							<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
								What we stand for
							</p>
							<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem]">
								Six pillars
								<br />
								we live by.
							</h2>
							<p className="mt-6 text-[#0a0d12]/60 text-[15px] leading-7">
								These aren't slogans. They're the decisions we
								make every time we write a line of code, answer
								a support ticket, or ship a new feature.
							</p>
						</div>

						{/* Right grid */}
						<div className="flex-1">
							<div className="grid gap-px overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-[#0a0d12]/8 sm:grid-cols-2">
								{pillars.map((pillar) => (
									<div
										key={pillar.number}
										className="bg-white p-8 lg:p-10"
									>
										<span className="font-semibold text-sm text-[#0a0d12]/24 tabular-nums">
											{pillar.number}
										</span>
										<h3 className="mt-3 font-semibold text-[#0a0d12] text-[17px] leading-snug">
											{pillar.title}
										</h3>
										<p className="mt-3 text-[#0a0d12]/56 text-[14px] leading-[1.7]">
											{pillar.description}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Our Story ─────────────────────────────────────── */}
			<section className="bg-[#05070b] text-white">
				<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
					<p className="font-semibold text-[11px] text-white/40 uppercase tracking-[0.16em]">
						Our story
					</p>
					<h2 className="mt-4 max-w-[620px] font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem]">
						Built out of frustration.
						<br />
						<span className="text-white/30">Refined with care.</span>
					</h2>

					{/* Timeline */}
					<div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
						{timeline.map((item) => (
							<div
								key={item.year + item.event}
								className="flex flex-col bg-[#05070b] p-8 lg:p-10"
							>
								<span className="font-semibold text-sm text-white/28 tabular-nums">
									{item.year}
								</span>
								<h3 className="mt-4 font-semibold text-lg text-white leading-snug">
									{item.event}
								</h3>
								<p className="mt-3 text-[15px] text-white/50 leading-relaxed">
									{item.detail}
								</p>
							</div>
						))}
					</div>

					{/* Story prose below timeline */}
					<div className="mt-20 grid gap-8 lg:grid-cols-2 lg:gap-16">
						<p className="text-[#ffffff]/60 text-[16px] leading-[1.8]">
							Email infrastructure shouldn't be a barrier to
							innovation. Yet for years, developers have been
							forced to choose between expensive proprietary
							solutions, opaque self-hosted setups, or unreliable
							free services. We knew there had to be a better way.
						</p>
						<p className="text-[#ffffff]/60 text-[16px] leading-[1.8]">
							Founded in 2024, Reloop was built to solve real
							problems with elegant solutions. We believe powerful
							tools should be simple to use, transparent in their
							operation, and accessible to teams of every size —
							from solo founders to enterprise engineering orgs.
						</p>
					</div>
				</div>
			</section>

			{/* ── CTA ──────────────────────────────────────────── */}
			<section className="bg-white text-[#0a0d12]">
				<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
					<div className="mx-auto max-w-[920px] text-center">
						<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
							Join our journey
						</p>
						<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
							There's a place
							<br />
							<span className="text-[#0a0d12]/40">for you here.</span>
						</h2>
						<p className="mx-auto mt-8 max-w-[560px] text-[#0a0d12]/60 text-[15px] leading-7 sm:text-[17px]">
							Whether you want to contribute code, join our team,
							or simply be part of our community — we're always
							looking for passionate people to help shape the
							future of email.
						</p>
						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<Link
								href="/careers"
								className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90"
							>
								View open positions
							</Link>
							<a
								href="https://github.com/reloop-labs/reloop"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/6"
							>
								Contribute on GitHub
							</a>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AboutUsPage;
