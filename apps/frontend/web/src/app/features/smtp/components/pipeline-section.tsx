import { Icon } from "@reloop/ui/icon";
import { SectionHeader } from "./section-header";

const STEPS: { title: string; description: string; icon: string }[] = [
	{
		title: "Authenticate",
		description:
			"A wrong or revoked key is refused at AUTH, so your app sees the error instantly.",
		icon: "key",
	},
	{
		title: "Check the sender",
		description:
			"Mail from a domain you haven't verified is rejected before it costs you reputation.",
		icon: "shield",
	},
	{
		title: "Sign with DKIM",
		description:
			"Every message is signed for your domain, so inboxes trust it as yours.",
		icon: "check-circle",
	},
	{
		title: "Deliver",
		description:
			"TLS to the receiving server, smart retries, and your dedicated IP if you have one.",
		icon: "mail-send",
	},
	{
		title: "Report back",
		description:
			"Delivered, bounced, opened, and clicked land in your logs and webhooks.",
		icon: "webhook",
	},
];

const EXTRAS: { title: string; description: string; icon: string }[] = [
	{
		title: "Bounces suppressed for you",
		description:
			"Hard bounces, complaints, and full mailboxes are suppressed automatically, so a stale address never keeps hurting your sender score.",
		icon: "bounce",
	},
	{
		title: "Dedicated IPs",
		description:
			"Send high-volume SMTP traffic from an IP only you use, and keep your reputation entirely in your hands.",
		icon: "dedicated-ip",
	},
	{
		title: "Open source relay",
		description:
			"The relay is open source and runs on KumoMTA. Use the hosted service, or run the whole stack on your own servers.",
		icon: "open-source",
	},
];

export function PipelineSection() {
	return (
		<section
			id="pipeline"
			aria-labelledby="pipeline-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<SectionHeader
				id="pipeline-heading"
				icon="route"
				eyebrow="Under the hood"
				title={
					<>
						More than a relay.
						<br />
						Every message gets the full pipeline.
					</>
				}
				description="SMTP sends go through the same delivery stack as the Reloop API. Your mailer doesn't need to know any of it."
			/>

			<ol className="grid border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-5 dark:border-white/10">
				{STEPS.map((step, index) => (
					<li
						key={step.title}
						className="flex flex-col gap-4 border-stroke-soft-100 border-b px-4 py-8 last:border-b-0 sm:px-8 sm:last:col-span-2 lg:border-r lg:border-b-0 lg:px-6 lg:py-10 lg:last:col-span-1 lg:last:border-r-0 dark:border-white/10 sm:[&:nth-child(odd):not(:last-child)]:border-r"
					>
						<span className="flex items-center justify-between">
							<span className="flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 shadow-xs dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
								<Icon name={step.icon} className="size-5" aria-hidden />
							</span>
							<span className="font-mono text-[12px] text-text-soft-400 dark:text-white/30">
								{String(index + 1).padStart(2, "0")}
							</span>
						</span>
						<span className="flex flex-col gap-1.5">
							<span className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
								{step.title}
							</span>
							<span className="text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{step.description}
							</span>
						</span>
					</li>
				))}
			</ol>

			<div className="grid lg:grid-cols-3">
				{EXTRAS.map((extra) => (
					<div
						key={extra.title}
						className="flex items-start gap-4 border-stroke-soft-100 border-b px-4 py-8 last:border-b-0 sm:px-8 lg:border-r lg:border-b-0 lg:px-10 lg:py-10 lg:last:border-r-0 dark:border-white/10"
					>
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 shadow-xs dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/60">
							<Icon name={extra.icon} className="size-5" aria-hidden />
						</span>
						<span className="flex flex-col gap-1.5">
							<span className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
								{extra.title}
							</span>
							<span className="text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{extra.description}
							</span>
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
