import { cn } from "@reloop/ui/cn";
import Link from "next/link";

type ScheduleRow = {
	age: string;
	cap: string;
	status: string;
	dot: string;
	action: string;
};

// Daily caps match the enforced bands in getDomainInitialDailyCap
// (packages/db/src/domain-age-cap.ts). 30+ days is dynamic (plan caps).
const SCHEDULE: ScheduleRow[] = [
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
		action: "Ramp gradually. Watch bounce rate and spam complaints closely.",
	},
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
		action: "Near-full volume. Keep list quality high and engagement clean.",
	},
	{
		age: "30+ days",
		cap: "Plan caps",
		status: "Mature",
		dot: "bg-emerald-500",
		action: "Full sending volume, subject to plan caps and engagement quality.",
	},
];

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

			{/* Schedule table */}
			<div className="border-stroke-soft-100 border-b dark:border-white/10">
				<div className="mx-auto w-full max-w-3xl border-stroke-soft-100 sm:border-x dark:border-white/10">
					<div
						aria-hidden
						className="hidden grid-cols-[110px_110px_140px_1fr] gap-4 border-stroke-soft-100 border-b px-4 py-3 sm:grid dark:border-white/10"
					>
						<span className="font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
							Domain age
						</span>
						<span className="font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
							Daily cap
						</span>
						<span className="font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
							Status
						</span>
						<span className="font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
							What to do
						</span>
					</div>
					{SCHEDULE.map((row, index) => (
						<div
							key={row.age}
							className={cn(
								"grid grid-cols-1 gap-1.5 px-4 py-5 sm:grid-cols-[110px_110px_140px_1fr] sm:items-baseline sm:gap-4 sm:py-4",
								index !== SCHEDULE.length - 1 &&
									"border-stroke-soft-100 border-b dark:border-white/10",
							)}
						>
							<span className="font-mono font-semibold text-[13px] text-text-strong-950 tabular-nums dark:text-white">
								{row.age}
							</span>
							<span className="font-medium font-mono text-[13px] text-text-strong-950 tabular-nums dark:text-white">
								{row.cap}
							</span>
							<span className="flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
								<span
									className={cn("size-1.5 shrink-0 rounded-full", row.dot)}
									aria-hidden
								/>
								{row.status}
							</span>
							<span className="text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
								{row.action}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Automation note */}
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<div className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4 sm:flex-row sm:items-center sm:gap-4 dark:border-white/10 dark:bg-white/[0.03]">
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-[14px] text-text-strong-950 leading-snug dark:text-white">
							Manual warmup is slow and easy to get wrong.
						</p>
						<p className="mt-0.5 text-[12.5px] text-stone-500 leading-relaxed dark:text-white/55">
							Reloop handles the warmup for you. No credit card required.
						</p>
					</div>
					<Link
						href="/dashboard/signup"
						className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary-base px-4 py-2 font-semibold text-[13px] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
					>
						Start free
					</Link>
				</div>
			</div>
		</section>
	);
}
