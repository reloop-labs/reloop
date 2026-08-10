import { cn } from "@reloop/ui/cn";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function Chip({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"mx-0.5 inline-flex translate-y-px items-center gap-1 rounded-md border border-blue-200/80 bg-blue-50 px-1.5 py-[0.2em] font-medium text-[0.92em] text-primary-base leading-none align-middle dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300",
				className,
			)}
		>
			{children}
		</span>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="mt-10 first:mt-0 sm:mt-12">
			<h2 className="font-semibold text-[1.05rem] text-text-strong-950 tracking-tight sm:text-[1.125rem] dark:text-white">
				{title}
			</h2>
			<div className="mt-3.5 space-y-4 text-[15px] text-text-sub-600 leading-[1.75] sm:text-[16px] dark:text-white/55">
				{children}
			</div>
		</section>
	);
}

function DotGridBackground() {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-[0.25]"
			style={{
				backgroundImage:
					"radial-gradient(circle, var(--color-stroke-soft-200) 1px, transparent 1px)",
				backgroundSize: "18px 18px",
			}}
		/>
	);
}

export function FounderLetter() {
	return (
		<div className="relative isolate overflow-hidden bg-bg-weak-50 dark:bg-black">
			<DotGridBackground />

			<div className="relative mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
				<article className="rounded-[1.75rem] border border-stroke-soft-200 bg-bg-white-0 px-6 py-10 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_rgba(15,23,42,0.06)] sm:rounded-[2rem] sm:px-10 sm:py-12 md:px-14 md:py-14 dark:border-white/10 dark:bg-[#0c0c0e] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_20px_50px_rgba(0,0,0,0.35)]">
					<header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
								Reloop Labs
							</p>
							<h1 className="mt-2 font-semibold text-[1.75rem] text-text-strong-950 tracking-tight sm:text-[2rem] dark:text-white">
								Letter from the founder
							</h1>
						</div>
						<time
							dateTime="2026-08-10"
							className="shrink-0 font-medium text-[14px] text-text-sub-600 underline decoration-stroke-soft-200 underline-offset-4 sm:pt-1 dark:text-white/45 dark:decoration-white/15"
						>
							August 10, 2026
						</time>
					</header>

					<div className="mt-8 space-y-4 text-[15px] text-text-sub-600 leading-[1.75] sm:mt-10 sm:text-[16px] dark:text-white/55">
						<p>
							This letter is written by <Chip>Pranav Patel</Chip>, co-founder of{" "}
							<Chip>
								<svg
									width="12"
									height="12"
									viewBox="0 0 200 200"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden
									className="opacity-90"
								>
									<rect x="55" y="51" width="83" height="10" fill="currentColor" />
									<rect
										x="55"
										y="59"
										width="75"
										height="10"
										transform="rotate(90 55 59)"
										fill="currentColor"
									/>
									<rect x="55" y="134" width="83" height="10" fill="currentColor" />
									<rect x="63" y="142" width="83" height="10" fill="currentColor" />
								</svg>
								Reloop
							</Chip>
							, for anyone who has ever needed email to just work — and still own
							the stack when it does.
						</p>
					</div>

					<Section title="Why we started">
						<p>
							Every product we shipped needed email: password resets, receipts,
							onboarding, alerts. The choices never felt right. Rent a proprietary
							API and trust routing you can’t read. Or run your own SMTP and hope
							deliverability holds when traffic spikes.
						</p>
						<p>
							Bills climbed. Status pages stayed opaque. At{" "}
							<Chip>2 a.m.</Chip> with failed sends, there was nothing left to
							debug but a black box. We wanted production-grade email you can
							audit, self-host, and actually understand.
						</p>
						<p>
							In{" "}
							<Chip>September 2025</Chip>,{" "}
							<Chip>Pranav</Chip> and{" "}
							<Chip>Twinkal</Chip> started{" "}
							<Chip>Reloop Labs</Chip> to build that stack — not a thin wrapper,
							but the full loop.
						</p>
					</Section>

					<Section title="What we’re building">
						<p>
							Whether you are a developer, founder, or ops engineer, you should be
							able to send transactionals, run campaigns, and inspect delivery
							without guessing. Reloop includes transactional APIs and{" "}
							<Chip>SMTP</Chip> drop-in, marketing sends, webhooks, analytics,
							inbound parsing, and agent inboxes — the same software whether you
							use <Chip>reloop.sh</Chip> or deploy on infrastructure you control.
						</p>
						<p>
							The principal place of work is the open internet. Our license is{" "}
							<Chip>Apache 2.0</Chip> with clear use terms. The code is public. The
							roadmap is public. There is no enterprise-only fork hiding behind a
							sales call.
						</p>
					</Section>

					<Section title="Our commitment">
						<p>
							We will keep Reloop open. Hosted and self-hosted stay the same
							codebase. You can leave without rewriting your notification layer.
							You can read how delivery works before you trust it.
						</p>
						<p>
							Sign up and send{" "}
							<Chip>3,000</Chip> emails per month free — or clone the repo and run
							it yourself. We are a small team shipping weekly, with room for
							contributors who care about craft.
						</p>
					</Section>

					<Section title="An invitation">
						<p>
							If you have been burned by black-box email, vendor lock-in, or
							pricing that punishes growth — try Reloop. Send your first mail.
							Open an issue. Star the repo. Tell us what is missing.
						</p>
						<p>
							We are not building a demo. We are building the email infrastructure
							we could not buy — and we are doing it where you can watch.
						</p>
					</Section>

					<footer className="mt-12 border-stroke-soft-200 border-t pt-8 dark:border-white/10">
						<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-4">
								<div className="relative size-12 overflow-hidden rounded-full border border-stroke-soft-200 bg-neutral-100 dark:border-white/10 dark:bg-white/5">
									<Image
										src="/company/team/pranav-patel.jpg"
										alt="Pranav Patel"
										fill
										className="object-cover"
										sizes="48px"
									/>
								</div>
								<div>
									<p className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
										Pranav Patel
									</p>
									<p className="text-[13px] text-text-sub-600 dark:text-white/45">
										Co-founder, Reloop Labs
									</p>
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								<a
									href="https://github.com/pranavp10"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 font-medium text-[13px] text-text-strong-950 transition-colors hover:border-primary-base/30 hover:text-primary-base dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:border-blue-400/40 dark:hover:text-blue-300"
								>
									GitHub
								</a>
								<a
									href="https://github.com/reloop-labs/reloop"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 font-medium text-[13px] text-text-strong-950 transition-colors hover:border-primary-base/30 hover:text-primary-base dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:border-blue-400/40 dark:hover:text-blue-300"
								>
									Reloop on GitHub
								</a>
								<Link
									href="/dashboard/signup"
									className="inline-flex items-center rounded-md bg-primary-base px-3 py-1.5 font-medium text-[13px] text-white transition-opacity hover:opacity-90"
								>
									Start sending free
								</Link>
							</div>
						</div>
					</footer>
				</article>
			</div>
		</div>
	);
}
