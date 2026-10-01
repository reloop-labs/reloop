import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";

const choices = [
	{
		name: "Reloop",
		label: "One connected email stack",
		description:
			"Choose Reloop when transactional email, campaigns, inbound replies, and agent inboxes need to work as one product.",
		points: ["Open source and self-hostable", "Built for apps and AI agents"],
		href: "/docs",
		linkLabel: "Explore Reloop",
		featured: true,
	},
	{
		name: "Resend or Postmark",
		label: "Focused transactional email",
		description:
			"A strong fit when your main job is sending dependable application email through a developer-friendly API.",
		points: ["Focused product surface", "Straightforward app-email workflow"],
		href: "/compare/resend",
		linkLabel: "Compare transactional tools",
	},
	{
		name: "SendGrid",
		label: "Established email infrastructure",
		description:
			"A practical choice for teams already invested in its Email API, templates, and marketing campaign tooling.",
		points: ["Long-standing ecosystem", "Transactional and campaign tools"],
		href: "/compare/sendgrid",
		linkLabel: "Compare with SendGrid",
	},
	{
		name: "Mailchimp",
		label: "Marketing-led workflows",
		description:
			"A natural choice when marketers own the work and campaigns, audience tools, and automations matter most.",
		points: ["Marketing-first experience", "Campaign and automation depth"],
		href: "/compare/mailchimp",
		linkLabel: "Compare with Mailchimp",
	},
] as const;

function GridCells({ count }: { count: number }) {
	return Array.from({ length: count }, (_, index) => (
		<div key={index}>
			<div className="h-full rounded-[4px] bg-white dark:bg-black" />
		</div>
	));
}

const bandClassName = "grid grid-cols-10 gap-px p-px [&>div]:aspect-square";
const sideClassName = "grid grid-rows-2 gap-px max-[1099px]:hidden";

export function HonestDifferentiation() {
	return (
		<section
			aria-labelledby="honest-differentiation-heading"
			className="bg-white dark:bg-black"
		>
			<div className="grid bg-zinc-950/[0.08] p-px dark:bg-zinc-50/10">
				<div aria-hidden="true" className={bandClassName}>
					<GridCells count={10} />
				</div>

				<div className="grid grid-cols-10 gap-px p-px">
					<div aria-hidden="true" className={sideClassName}>
						<GridCells count={2} />
					</div>
					<div className="col-span-8 grid gap-px max-[1099px]:col-[1/-1] lg:grid-cols-8">
						<div className="rounded-[4px] bg-white px-6 py-14 sm:px-10 sm:py-16 lg:col-span-5 lg:px-12 dark:bg-black">
							<p className="font-medium text-[12px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/45">
								Honest comparison
							</p>
							<h2
								id="honest-differentiation-heading"
								className="mt-4 max-w-2xl text-balance font-semibold text-4xl text-text-strong-950 tracking-[-0.04em] sm:text-5xl dark:text-white"
							>
								Use the right email tool. Or stop stitching four together.
							</h2>
						</div>
						<div className="flex items-end rounded-[4px] bg-white px-6 py-10 sm:px-10 lg:col-span-3 lg:px-9 lg:py-14 dark:bg-black">
							<p className="max-w-md text-base text-text-sub-600 leading-7 dark:text-white/55">
								Specialists are excellent when your problem is narrow. Reloop is
								for teams that want sending, campaigns, replies, and agent
								workflows in one open platform.
							</p>
						</div>
					</div>
					<div aria-hidden="true" className={sideClassName}>
						<GridCells count={2} />
					</div>
				</div>

				<div className="grid grid-cols-10 gap-px p-px">
					<div aria-hidden="true" className={sideClassName}>
						<GridCells count={2} />
					</div>
					<div className="col-span-8 grid gap-px max-[1099px]:col-[1/-1] md:grid-cols-2">
						{choices.map((choice) => (
							<article
								key={choice.name}
								className="relative flex min-h-[340px] flex-col rounded-[4px] bg-white p-6 sm:p-8 lg:p-9 dark:bg-black"
							>
								{"featured" in choice && choice.featured ? (
									<span className="absolute top-6 right-6 rounded-full bg-blue-600 px-3 py-1 font-medium text-[11px] text-white uppercase tracking-[0.12em] sm:top-8 sm:right-8">
										Built for the whole loop
									</span>
								) : null}
								<p className="font-semibold text-sm text-text-sub-600 dark:text-white/45">
									{choice.name}
								</p>
								<h3 className="mt-8 max-w-md font-semibold text-2xl text-text-strong-950 tracking-[-0.025em] sm:text-3xl dark:text-white">
									{choice.label}
								</h3>
								<p className="mt-4 max-w-lg text-[15px] text-text-sub-600 leading-6 dark:text-white/55">
									{choice.description}
								</p>
								<ul className="mt-7 space-y-3">
									{choice.points.map((point) => (
										<li
											key={point}
											className="flex items-center gap-2.5 text-sm text-text-strong-950 dark:text-white/75"
										>
											<span className="flex size-5 items-center justify-center rounded-full border border-zinc-950/10 dark:border-white/15">
												<Check className="size-3" strokeWidth={2} />
											</span>
											{point}
										</li>
									))}
								</ul>
								<Link
									href={choice.href}
									className="mt-auto flex w-fit items-center gap-1.5 pt-9 font-medium text-sm text-text-strong-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
								>
									{choice.linkLabel}
									<ArrowUpRight className="size-4" />
								</Link>
							</article>
						))}
					</div>
					<div aria-hidden="true" className={sideClassName}>
						<GridCells count={2} />
					</div>
				</div>

				<div aria-hidden="true" className={bandClassName}>
					<GridCells count={10} />
				</div>
			</div>
		</section>
	);
}
