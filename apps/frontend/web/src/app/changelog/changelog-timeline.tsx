import Link from "next/link";
import type { ChangelogRelease } from "./changelog-types";
import { getChangelogReleasePath, getTagDotColor } from "./changelog-utils";

type MonthGroup = {
	date: string;
	releases: ChangelogRelease[];
};

export function ChangelogTimeline({
	releases,
	activeYear,
	newerYear,
	olderYear,
}: {
	releases: ChangelogRelease[];
	activeYear?: string;
	newerYear?: string | null;
	olderYear?: string | null;
}) {
	// Group consecutive releases by date month
	const groups: MonthGroup[] = [];
	for (const release of releases) {
		const lastGroup = groups[groups.length - 1];
		if (lastGroup && lastGroup.date === release.date) {
			lastGroup.releases.push(release);
		} else {
			groups.push({ date: release.date, releases: [release] });
		}
	}

	return (
		<div>
			<div className="divide-y divide-stroke-soft-200/80 dark:divide-white/10">
				{groups.map((group) => (
					<section
						key={group.date}
						className="grid grid-cols-1 gap-4 px-6 py-8 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-6 sm:px-10 sm:py-10 lg:gap-8 lg:px-12"
					>
						{/* Left sticky column for the month header */}
						<div className="sm:sticky sm:top-24 sm:self-start sm:pt-4">
							<time className="block font-medium text-[13.5px] text-text-sub-600 tabular-nums dark:text-white/55">
								{group.date}
							</time>
						</div>

						{/* Right column with list of release items in this month */}
						<div className="min-w-0 divide-y divide-dashed divide-stroke-soft-200/90 dark:divide-white/10">
							{group.releases.map((release) => {
								const href = getChangelogReleasePath(
									release.slug || release.version,
								);
								return (
									<div
										key={`${release.version}-${release.title}`}
										className="py-1.5 first:pt-0 last:pb-0"
									>
										<Link
											href={href}
											className="-mx-3.5 group flex flex-col gap-4 rounded-xl p-3.5 outline-none transition-colors hover:bg-bg-weak-50/80 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-white/[0.03]"
										>
											<div className="min-w-0 flex-1 pr-4 sm:pr-6">
												<h2 className="font-medium text-[16px] text-text-strong-950 leading-snug tracking-tight sm:text-[17px] dark:text-white">
													{release.title}
												</h2>
												<p className="mt-1 max-w-xl text-[13.5px] text-text-sub-600 leading-normal sm:text-[14px] dark:text-white/55">
													{release.description}
												</p>
											</div>

											<div className="flex w-full shrink-0 items-center justify-between gap-6 self-start sm:w-auto sm:gap-10 sm:self-center">
												{release.tags && release.tags.length > 0 ? (
													<ul className="flex w-28 flex-col gap-1 font-medium text-[12.5px] text-text-sub-600 sm:w-32 dark:text-white/55">
														{release.tags.slice(0, 3).map((tag) => (
															<li
																key={tag}
																className="flex items-center gap-1.5"
															>
																<span
																	className={`size-1.5 shrink-0 rounded-full ${getTagDotColor(tag)}`}
																	aria-hidden="true"
																/>
																<span className="truncate">{tag}</span>
															</li>
														))}
													</ul>
												) : (
													<div className="w-28 sm:w-32" />
												)}

												<div className="flex shrink-0 items-center justify-end">
													<svg
														className="size-3 text-text-sub-600/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-text-strong-950 dark:text-white/40 dark:group-hover:text-white"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														strokeWidth="3"
														aria-hidden="true"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
														/>
													</svg>
												</div>
											</div>
										</Link>
									</div>
								);
							})}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
