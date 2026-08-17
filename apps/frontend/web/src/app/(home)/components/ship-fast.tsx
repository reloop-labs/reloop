import * as Button from "@reloop/ui/button";
import Link from "next/link";
import {
	changelogReleases,
	getChangelogReleasePath,
} from "../../changelog/changelog-utils";

const RECENT_COUNT = 4;

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
		return `${month} ${Number(day)}, ${year}`;
	}
	if (parts.length === 2) {
		const [month, year] = parts;
		return `${month} ${year}`;
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
			className="w-full border-stroke-soft-200 border-t dark:border-white/10"
		>
			<div className="lg:grid lg:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)]">
				<div className="flex flex-col items-start px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
					<h2
						id="ship-fast-heading"
						className="font-serif text-[2.4rem] text-text-strong-950 italic leading-[1.05] tracking-tighter sm:text-[3rem] lg:text-[3.4rem] dark:text-white"
					>
						We ship fast
					</h2>
					<p className="mt-4 max-w-[420px] text-[15px] text-text-sub-600 leading-7 sm:text-[16px] dark:text-white/60">
						Always improving, adding features and functionality.
					</p>
					<Link
						href="/changelog"
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
						}).root()} mt-8 h-10! rounded-full! px-5! font-medium text-[13.5px]`}
					>
						Full changelog
					</Link>
				</div>

				<div
					aria-hidden="true"
					className="hidden self-stretch text-stroke-soft-200 lg:block dark:text-white/15"
					style={{
						backgroundImage:
							"repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px 7px)",
					}}
				/>

				<div className="flex min-w-0 flex-col">
					<ol className="flex flex-1 flex-col border-stroke-soft-200 border-r dark:border-white/10">
						{recentReleases.map((release) => (
							<li
								key={release.href}
								className="border-stroke-soft-200 border-t first:border-t-0 lg:border-t-0 dark:border-white/10"
							>
								<Link
									href={release.href}
									className="group block px-4 py-8 outline-none transition-colors duration-200 ease-out sm:px-6 sm:py-9 lg:px-8 lg:py-10"
								>
									<time
										className="block text-[12.5px] text-text-sub-600 leading-none dark:text-white/45"
										{...(release.isoDate ? { dateTime: release.isoDate } : {})}
									>
										{release.date}
									</time>
									<span className="mt-2.5 block font-semibold text-[17px] text-text-strong-950 leading-snug tracking-tight transition-colors duration-200 ease-out group-hover:text-text-strong-950/75 sm:text-[18px] dark:text-white dark:group-hover:text-white/80">
										{release.title}
									</span>
									{release.description ? (
										<span className="mt-1.5 block max-w-xl text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
											{release.description}
										</span>
									) : null}
								</Link>
							</li>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
