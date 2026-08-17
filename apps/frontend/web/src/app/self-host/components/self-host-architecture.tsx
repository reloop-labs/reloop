import { Icon } from "@reloop/ui/icon";

export function SelfHostArchitecture() {
	const components = [
		{
			title: "Core Web & API Gateway",
			desc: "Handles REST APIs, authenticated sessions, template rendering, and AI agent inbox endpoints.",
			tech: "Next.js App Router • TypeScript",
			icon: "layout" as const,
		},
		{
			title: "Inbound & Outbound MTA",
			desc: "High-performance SMTP server for handling inbound webhooks, bounces, TLS encryption, and deliverability handshakes.",
			tech: "Node / Go SMTP Server • STARTTLS",
			icon: "server" as const,
		},
		{
			title: "Async Queue & Background Workers",
			desc: "Reliable background jobs for retries, rate limiting, template compilation, webhook dispatches, and agent tasks.",
			tech: "BullMQ • Redis 7+",
			icon: "activity" as const,
		},
		{
			title: "Primary Relational Storage",
			desc: "Stores users, API keys, email logs, suppression lists, bounce records, and domain DKIM credentials.",
			tech: "PostgreSQL 16+",
			icon: "globe" as const,
		},
	];

	return (
		<section className="border-stroke-soft-200 border-t py-16 sm:py-20 dark:border-white/10">
			<div className="mx-auto max-w-5xl px-6 sm:px-8 md:max-w-7xl lg:px-12">
				<div className="text-center">
					<h2 className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-4xl dark:text-white">
						Architecture & Core Services
					</h2>
					<p className="mt-3 text-[14.5px] text-text-sub-600 sm:text-base dark:text-white/60">
						Everything you need for an enterprise email infrastructure in a streamlined modular stack.
					</p>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{components.map((c) => (
						<div
							key={c.title}
							className="flex flex-col rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/40 p-6 transition-all hover:border-stroke-soft-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
						>
							<div className="flex size-10 items-center justify-center rounded-xl bg-bg-white-0 shadow-sm dark:bg-white/10">
								<Icon name={c.icon} className="size-5 text-text-strong-950 dark:text-white" />
							</div>
							<h3 className="mt-4 font-semibold text-[15px] text-text-strong-950 dark:text-white">
								{c.title}
							</h3>
							<p className="mt-2 flex-1 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
								{c.desc}
							</p>
							<div className="mt-4 pt-4 border-t border-stroke-soft-200/60 font-mono text-[11px] text-text-sub-600 dark:border-white/10 dark:text-white/40">
								{c.tech}
							</div>
						</div>
					))}
				</div>

				{/* System Specs Box */}
				<div className="mt-10 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-6 sm:p-8 dark:border-white/10 dark:bg-white/[0.02]">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
						<div>
							<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">Minimum Specs (Dev / Test)</h4>
							<p className="mt-1 text-[13px] text-text-sub-600 dark:text-white/60">
								1 vCPU, 1 GB RAM, 10 GB SSD. Ideal for local testing and lightweight internal apps.
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">Recommended (Production)</h4>
							<p className="mt-1 text-[13px] text-text-sub-600 dark:text-white/60">
								2-4 vCPUs, 4-8 GB RAM, 40+ GB SSD. Handles hundreds of thousands of sends per hour.
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">Port Requirements</h4>
							<p className="mt-1 text-[13px] text-text-sub-600 dark:text-white/60">
								Port 80/443 (HTTP/HTTPS), Port 25 (Inbound/Outbound SMTP), Port 587 (TLS Submission).
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
