import Link from "next/link";
import {
	getChangelogReleasePath,
	getChangelogReleases,
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

function formatRowDate(raw?: string): string {
	if (!raw) return "";
	const parts = raw.trim().split(/\s+/);
	if (parts.length === 3) {
		const [day, month, year] = parts;
		const shortMonth = month ? (MONTHS[month] ?? month) : "";
		const dayNum = String(Number(day)).padStart(2, "0");
		return `${shortMonth.toLowerCase()} ${dayNum}, ${year}`;
	}
	if (parts.length === 2) {
		const [month, year] = parts;
		const shortMonth = month ? (MONTHS[month] ?? month) : "";
		return `${shortMonth.toLowerCase()} ${year}`;
	}
	return raw.toLowerCase();
}

function toIsoDate(raw?: string): string | undefined {
	if (!raw) return undefined;
	const parts = raw.trim().split(/\s+/);
	if (parts.length !== 3) return undefined;
	const [day, month, year] = parts;
	if (!day || !month || !year) return undefined;
	const monthIndex = Object.keys(MONTHS).indexOf(month);
	if (monthIndex === -1) return undefined;
	return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`;
}

export default function ShipFast() {
	const allReleases = getChangelogReleases();
	const recentReleases = allReleases.slice(0, RECENT_COUNT).map((release) => {
		const rawDate = release.launchDate || release.date;
		return {
			title: release.title,
			description: release.description,
			href: getChangelogReleasePath(release.slug || release.version),
			date: formatRowDate(rawDate),
			isoDate: toIsoDate(rawDate),
		};
	});

	if (recentReleases.length === 0) return null;

	return (
		<section
			id="ship-fast"
			aria-labelledby="ship-fast-heading"
			className="w-full px-6 py-16 sm:px-8 sm:py-20 md:px-12 md:py-24"
		>
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="flex flex-col items-start">
					<div className="flex w-full items-baseline justify-between">
						<h2
							id="ship-fast-heading"
							className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-4xl dark:text-white"
						>
							We ship fast
						</h2>
						<Link
							href="/changelog"
							className="font-mono text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white"
						>
							Full changelog →
						</Link>
					</div>
				</div>

				{/* Changelog Minimal Rows */}
				<div className="mt-8 divide-y divide-stroke-soft-200 border-stroke-soft-200 border-t border-b dark:divide-white/10 dark:border-white/10">
					{recentReleases.map((release) => (
						<Link
							key={release.href}
							href={release.href}
							className="group flex flex-col gap-1.5 py-5 sm:flex-row sm:gap-8 sm:py-6"
						>
							<time
								className="w-28 shrink-0 pt-0.5 font-mono text-[12px] text-text-sub-600 transition-colors group-hover:text-text-strong-950 sm:w-32 sm:text-[12.5px] dark:text-white/40 dark:group-hover:text-white/70"
								{...(release.isoDate ? { dateTime: release.isoDate } : {})}
							>
								{release.date}
							</time>
							<div className="min-w-0 flex-1">
								<h3 className="font-medium text-[14.5px] text-text-strong-950 tracking-tight transition-colors group-hover:text-amber-600 sm:text-[15px] dark:text-white dark:group-hover:text-amber-400">
									{release.title}
								</h3>
								{release.description && (
									<p className="mt-1 text-[13px] text-text-sub-600 leading-relaxed sm:text-[13.5px] dark:text-white/50">
										{release.description}
									</p>
								)}
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
