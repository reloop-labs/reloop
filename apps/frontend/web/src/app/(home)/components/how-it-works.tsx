"use client";

import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

const steps = [
	{
		title: "Sign up & create your workspace",
		description:
			"Enter your email, verify with a code, and you’re in. Your workspace is created automatically — no setup wizard, no configuration forms.",
	},
	{
		title: "Connect your domain & SMTP",
		description:
			"Configure your DNS records and connect your SMTP server. Reloop auto-detects configuration for major providers like Postmark, Resend, and SendGrid.",
	},
	{
		title: "Create your first mail pipeline",
		description:
			"Define routing rules, transformations, and security policies. Pipelines activate automatically on incoming requests or scheduled triggers.",
	},
	{
		title: "Send mail and watch it deliver",
		description:
			"Pick your pipeline and send a test request. The email is queued, processed, and delivered with sub-900ms latency. Watch delivery in real time.",
	},
];

const githubUrl = "https://github.com/reloop-labs/reloop";

export function HowItWorks() {
	return (
		<section id="how-it-works" className="bg-[#05070b] text-white">
			<div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
				<p className="font-semibold text-[11px] text-white/40 uppercase tracking-[0.16em]">
					Get started
				</p>
				<h2 className="mt-4 text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
					Supercharge your mail infrastructure
					<br />
					<span className="text-white/40">in the next hour.</span>
				</h2>

				<div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
					{steps.map((step, i) => (
						<div key={i} className="flex flex-col bg-[#05070b] p-8 lg:p-10">
							<span className="font-semibold text-[13px] text-white/28 tabular-nums">
								{String(i + 1).padStart(2, "0")}
							</span>
							<h3 className="mt-4 font-semibold text-[17px] text-white leading-snug sm:text-[18px]">
								{step.title}
							</h3>
							<p className="mt-3 text-[14px] text-white/50 leading-[1.7] sm:text-[15px]">
								{step.description}
							</p>
						</div>
					))}
				</div>

				<div className="mt-14 flex flex-wrap items-center gap-4">
					<Link
						href="/login"
						className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-semibold text-[15px] text-black transition-colors hover:bg-white/90"
					>
						Get started
					</Link>
					<a
						href={githubUrl}
						target="_blank"
						rel="noreferrer"
						className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-8 font-semibold text-[15px] text-white transition-colors hover:bg-white/10"
					>
						<Icon name="social-github" className="size-4" />
						View on GitHub
					</a>
				</div>
			</div>
		</section>
	);
}

export default HowItWorks;
