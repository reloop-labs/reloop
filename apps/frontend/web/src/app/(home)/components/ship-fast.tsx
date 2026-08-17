import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import {
	changelogReleases,
	getChangelogReleasePath,
} from "../../changelog/changelog-utils";

const RECENT_COUNT = 5;

const MONTHS: Record<string, string> = {
	January: "Jan",
	February: "Feb",
	March: "Mar",
	April: "Apr",
	May: "May",
	June: "Jun",
	July: "Jul",
	August: "Aug",
	September: "Sep",
	October: "Oct",
	November: "Nov",
	December: "Dec",
};

function formatTimelineDate(raw: string): string {
	const parts = raw.trim().split(/\s+/);
	if (parts.length === 3) {
		const [day, month, year] = parts;
		const shortMonth = month ? (MONTHS[month] ?? month) : "";
		return `${shortMonth} ${Number(day)}, ${year}`;
	}
	if (parts.length === 2) {
		const [month, year] = parts;
		const shortMonth = month ? (MONTHS[month] ?? month) : "";
		return `${shortMonth} ${year}`;
	}
	return raw;
}

function toIsoDate(raw: string): string | undefined {
	const parts = raw.trim().split(/\s+/);
	if (parts.length !== 3) return undefined;
	const [day, month, year] = parts;
	if (!day || !month || !year) return undefined;
	const monthIndex = Object.keys(MONTHS).indexOf(month);
	if (monthIndex === -1) return undefined;
	return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`;
}

const recentReleases = changelogReleases
	.slice(0, RECENT_COUNT)
	.map((release) => {
		const rawDate = release.launchDate || release.date;
		return {
			title: release.title,
			description: release.description,
			href: getChangelogReleasePath(release.slug || release.version),
			date: formatTimelineDate(rawDate),
			isoDate: toIsoDate(rawDate),
		};
	});

export default function ShipFast() {
	if (recentReleases.length === 0) return null;

	return (
		<section
			id="ship-fast"
			aria-labelledby="ship-fast-heading"
			className="w-full"
		>
			<div className="lg:grid lg:grid-cols-2">
				<div className="flex flex-col items-start px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
					<h2
						id="ship-fast-heading"
						className="font-medium font-serif text-[2.4rem] text-text-strong-950 italic leading-[1.05] tracking-tighter sm:text-[3rem] lg:text-[3.4rem] dark:text-white"
					>
						We ship <b className="font-bold font-sans">Fast</b>
					</h2>
					<p className="mt-4 max-w-[420px] text-[15px] text-text-sub-600 leading-7 sm:text-[16px] dark:text-white/60">
						Always improving, adding features and functionality.
					</p>
					<Link
						href="/changelog"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()} mt-8 h-10! px-5! font-medium text-[13.5px]`}
					>
						Full changelog
					</Link>
				</div>

				<div className="flex min-w-0 flex-col justify-center border-stroke-soft-200 border-t lg:border-t-0 lg:border-l dark:border-white/10">
					<ol className="relative flex flex-1 flex-col">
						{recentReleases.map((release, index) => {
							const isLast = index === recentReleases.length - 1;
							return (
								<li
									key={release.href}
									className={`relative flex flex-1 ${isLast ? "opacity-35" : ""}`}
								>
									{/* Vertical timeline line segments */}
									{index > 0 && (
										<div
											aria-hidden="true"
											className="-translate-x-1/2 pointer-events-none absolute top-0 bottom-1/2 left-[44px] w-px bg-stroke-soft-200 sm:left-[52px] lg:left-[60px] dark:bg-white/10"
										/>
									)}
									{!isLast && (
										<div
											aria-hidden="true"
											className="-translate-x-1/2 pointer-events-none absolute top-1/2 bottom-0 left-[44px] w-px bg-stroke-soft-200 sm:left-[52px] lg:left-[60px] dark:bg-white/10"
										/>
									)}

									<Link
										href={release.href}
										className="group relative flex flex-1 items-center gap-5 px-6 py-6.5 text-left outline-none transition-colors duration-200 hover:bg-[#f6f6f7] sm:px-8 sm:py-7 lg:px-10 lg:py-8 dark:hover:bg-white/[0.03]"
									>
										{/* Subtle grid texture overlay on hover */}
										<div
											aria-hidden="true"
											className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:24px_24px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)]"
										/>

										{/* Circular badge with calendar <-> arrow icon swap on hover */}
										<div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-xs transition-colors duration-200 group-hover:border-stroke-strong-950 group-hover:text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white/60 dark:group-hover:border-white/40 dark:group-hover:text-white">
											<Icon
												name="calendar"
												className="size-4.5 transition-all duration-200 group-hover:scale-0 group-hover:opacity-0"
											/>
											<Icon
												name="arrow-up-right"
												className="absolute size-4.5 scale-0 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
											/>
										</div>

										{/* Content: Title & Date */}
										<div className="relative z-10">
											<span className="block font-semibold text-[15px] text-text-strong-950 leading-snug tracking-tight transition-colors duration-200 group-hover:text-text-strong-950/75 sm:text-[16px] dark:text-white dark:group-hover:text-white/80">
												{release.title}
											</span>
											<time
												className="mt-1 block text-[13px] text-text-sub-600 leading-none dark:text-white/45"
												{...(release.isoDate
													? { dateTime: release.isoDate }
													: {})}
											>
												{release.date}
											</time>
										</div>
									</Link>
								</li>
							);
						})}
					</ol>
				</div>
			</div>
		</section>
	);
}
