import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { Fragment } from "react";

type ScheduleRow = {
	age: string;
	cap: string;
	status: string;
	dot: string;
	action: string;
};

type ScheduleSection = {
	title: string;
	icon: string;
	rows: ScheduleRow[];
};

// Daily caps match the enforced bands in getDomainInitialDailyCap
// (packages/db/src/domain-age-cap.ts). 30+ days is dynamic (plan caps).
const SCHEDULE_SECTIONS: ScheduleSection[] = [
	{
		title: "Initial Ramp (0–7 days)",
		icon: "limit",
		rows: [
			{
				age: "0–1 days",
				cap: "20 / day",
				status: "Too new",
				dot: "bg-rose-500",
				action: "Publish SPF, DKIM, DMARC. Don't send bulk or cold email yet.",
			},
			{
				age: "2–3 days",
				cap: "50 / day",
				status: "High risk",
				dot: "bg-orange-500",
				action: "Begin slow warmup to engaged contacts only (no cold lists).",
			},
			{
				age: "4–7 days",
				cap: "100 / day",
				status: "Building",
				dot: "bg-amber-500",
				action:
					"Ramp gradually. Watch bounce rate and spam complaints closely.",
			},
		],
	},
	{
		title: "Volume Scaling (8–30+ days)",
		icon: "sparkling",
		rows: [
			{
				age: "8–14 days",
				cap: "250 / day",
				status: "Building",
				dot: "bg-amber-500",
				action: "Continue ramp; monitor DMARC reports for auth failures.",
			},
			{
				age: "15–30 days",
				cap: "500 / day",
				status: "Maturing",
				dot: "bg-blue-500",
				action:
					"Near-full volume. Keep list quality high and engagement clean.",
			},
			{
				age: "30+ days",
				cap: "Plan caps",
				status: "Mature",
				dot: "bg-emerald-500",
				action:
					"Full sending volume, subject to plan caps and engagement quality.",
			},
		],
	},
];

const SCHEDULE_GRID_COLS =
	"grid-cols-[minmax(180px,1.2fr)_minmax(140px,0.9fr)_minmax(150px,1fr)_minmax(320px,2.2fr)]";

export function WarmupSchedule() {
	return (
		<section
			id="warmup-schedule"
			aria-labelledby="warmup-schedule-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					Warmup schedule
				</p>
				<h2
					id="warmup-schedule-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					Domain warmup schedule.
				</h2>
				<p className="mt-2 max-w-2xl text-[14px] text-stone-500 leading-relaxed dark:text-white/60">
					Safe daily send caps by domain age - the same caps Reloop enforces
					automatically for every new domain.
				</p>
			</div>

			{/* Schedule table — styled identical to the pricing comparison table */}
			<div className="w-full overflow-x-auto lg:overflow-visible">
				<div className={cn("grid w-full min-w-[780px]", SCHEDULE_GRID_COLS)}>
					{/* Header row */}
					<div className="sticky top-16 z-30 flex items-center border-stroke-soft-100 border-b bg-bg-white-0/95 px-5 py-5 backdrop-blur-md sm:px-7 lg:px-9 dark:border-white/10 dark:bg-black/95">
						<span className="font-medium text-[15px] text-text-strong-950 leading-none dark:text-white">
							Domain age
						</span>
					</div>
					<div className="sticky top-16 z-30 flex items-center justify-center border-stroke-soft-100 border-b border-l bg-bg-white-0/95 px-4 py-5 text-center backdrop-blur-md dark:border-white/10 dark:bg-black/95">
						<span className="font-medium text-[15px] text-text-strong-950 leading-none dark:text-white">
							Daily cap
						</span>
					</div>
					<div className="sticky top-16 z-30 flex items-center justify-center border-stroke-soft-100 border-b border-l bg-bg-white-0/95 px-4 py-5 text-center backdrop-blur-md dark:border-white/10 dark:bg-black/95">
						<span className="font-medium text-[15px] text-text-strong-950 leading-none dark:text-white">
							Status
						</span>
					</div>
					<div className="sticky top-16 z-30 flex items-center border-stroke-soft-100 border-b border-l bg-bg-white-0/95 px-5 py-5 backdrop-blur-md sm:px-7 lg:px-9 dark:border-white/10 dark:bg-black/95">
						<span className="font-medium text-[15px] text-text-strong-950 leading-none dark:text-white">
							What to do
						</span>
					</div>

					{/* Spacer row like in reference (empty hairline row) */}
					<div className="h-14 border-stroke-soft-100 border-b dark:border-white/10" />
					<div className="h-14 border-stroke-soft-100 border-b border-l dark:border-white/10" />
					<div className="h-14 border-stroke-soft-100 border-b border-l dark:border-white/10" />
					<div className="h-14 border-stroke-soft-100 border-b border-l dark:border-white/10" />

					{SCHEDULE_SECTIONS.map((section, sectionIndex) => (
						<Fragment key={section.title}>
							{sectionIndex > 0 && (
								<>
									<div className="h-14 border-stroke-soft-100 border-b dark:border-white/10" />
									<div className="h-14 border-stroke-soft-100 border-b border-l dark:border-white/10" />
									<div className="h-14 border-stroke-soft-100 border-b border-l dark:border-white/10" />
									<div className="h-14 border-stroke-soft-100 border-b border-l dark:border-white/10" />
								</>
							)}
							<div className="flex items-center gap-2.5 border-stroke-soft-100 border-b px-5 pt-6 pb-3 sm:px-7 lg:px-9 dark:border-white/[0.07]">
								<Icon
									name={section.icon}
									className="size-4 shrink-0 text-text-strong-950 dark:text-white/80"
								/>
								<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
									{section.title}
								</span>
							</div>
							<div className="border-stroke-soft-100 border-b border-l pt-6 pb-3 dark:border-white/[0.07]" />
							<div className="border-stroke-soft-100 border-b border-l pt-6 pb-3 dark:border-white/[0.07]" />
							<div className="border-stroke-soft-100 border-b border-l pt-6 pb-3 dark:border-white/[0.07]" />

							{section.rows.map((row) => (
								<div
									key={row.age}
									className="group/row col-span-full grid grid-cols-subgrid"
								>
									<div
										className={cn(
											"flex min-h-[60px] items-center border-stroke-soft-100 border-b px-5 py-4 sm:px-7 lg:px-9 dark:border-white/[0.07]",
											"transition-colors group-hover/row:bg-bg-weak-50/70 dark:group-hover/row:bg-white/[0.03]",
										)}
									>
										<span className="font-medium font-mono text-[14px] text-text-strong-950 tabular-nums dark:text-white">
											{row.age}
										</span>
									</div>
									<div
										className={cn(
											"flex min-h-[60px] items-center justify-center border-stroke-soft-100 border-b border-l px-4 py-4 text-center dark:border-white/[0.07]",
											"transition-colors group-hover/row:bg-bg-weak-50/70 dark:group-hover/row:bg-white/[0.03]",
										)}
									>
										<span className="font-medium font-mono text-[13.5px] text-text-strong-950 tabular-nums dark:text-white">
											{row.cap}
										</span>
									</div>
									<div
										className={cn(
											"flex min-h-[60px] items-center justify-center gap-2 border-stroke-soft-100 border-b border-l px-4 py-4 text-center dark:border-white/[0.07]",
											"transition-colors group-hover/row:bg-bg-weak-50/70 dark:group-hover/row:bg-white/[0.03]",
										)}
									>
										<span
											className={cn("size-1.5 shrink-0 rounded-full", row.dot)}
											aria-hidden
										/>
										<span className="font-medium text-[13.5px] text-text-strong-950 dark:text-white">
											{row.status}
										</span>
									</div>
									<div
										className={cn(
											"flex min-h-[60px] items-center border-stroke-soft-100 border-b border-l px-5 py-4 sm:px-7 lg:px-9 dark:border-white/[0.07]",
											"transition-colors group-hover/row:bg-bg-weak-50/70 dark:group-hover/row:bg-white/[0.03]",
										)}
									>
										<span className="text-[13.5px] text-stone-600 leading-relaxed dark:text-white/70">
											{row.action}
										</span>
									</div>
								</div>
							))}
						</Fragment>
					))}
				</div>
			</div>

			{/* Automation note */}
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<div className="mx-auto flex w-full max-w-4xl flex-col gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4 sm:flex-row sm:items-center sm:gap-4 dark:border-white/10 dark:bg-white/[0.03]">
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-[14px] text-text-strong-950 leading-snug dark:text-white">
							Manual warmup is slow and easy to get wrong.
						</p>
						<p className="mt-0.5 text-[12.5px] text-stone-500 leading-relaxed dark:text-white/55">
							Reloop handles the warmup for you. No credit card required.
						</p>
					</div>
					<FancyButton.Root
						asChild
						variant="primary"
						size="small"
						className="shrink-0 rounded-full! px-5! dark:text-black"
					>
						<Link href="/dashboard/signup">Start free</Link>
					</FancyButton.Root>
				</div>
			</div>
		</section>
	);
}
