"use client";

import { useMemo } from "react";

// Generate deterministic realistic contribution activity data
function generateContributions(weeksCount = 44) {
	// Seeded pseudo-random generator
	let seed = 42;
	const random = () => {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	};

	const matrix: number[][] = [];
	for (let w = 0; w < weeksCount; w++) {
		const week: number[] = [];
		for (let d = 0; d < 7; d++) {
			const r = random();
			// Higher activity on weekdays (d between 1 and 5)
			const isWeekday = d >= 1 && d <= 5;
			let level = 0;

			if (isWeekday) {
				if (r > 0.82) level = 4;
				else if (r > 0.58) level = 3;
				else if (r > 0.32) level = 2;
				else if (r > 0.12) level = 1;
				else level = 0;
			} else {
				if (r > 0.88) level = 2;
				else if (r > 0.65) level = 1;
				else level = 0;
			}
			week.push(level);
		}
		matrix.push(week);
	}
	return matrix;
}

const monthLabels = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

export function GitHubContributionGraph() {
	const weeks = useMemo(() => generateContributions(48), []);

	const getLevelColor = (level: number) => {
		switch (level) {
			case 1:
				return "bg-[#9be9a8] dark:bg-[#0e4429] border-[#8ce39a] dark:border-[#195a37]";
			case 2:
				return "bg-[#40c463] dark:bg-[#006d32] border-[#36b959] dark:border-[#0e8a43]";
			case 3:
				return "bg-[#30a14e] dark:bg-[#26a641] border-[#299144] dark:border-[#38bd54]";
			case 4:
				return "bg-[#216e39] dark:bg-[#39d353] border-[#1c5d30] dark:border-[#4be465]";
			default:
				return "bg-[#ebedf0] dark:bg-[#161b22] border-black/5 dark:border-white/5";
		}
	};

	return (
		<div className="w-full overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs sm:p-6 dark:border-white/10 dark:bg-black">
			{/* Graph Header */}
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-stroke-soft-200 border-b pb-4 dark:border-white/10">
				<div className="flex items-center gap-2.5">
					<svg
						className="size-4.5 text-text-strong-950 dark:text-white"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
						/>
					</svg>
					<span className="font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
						reloop-labs/reloop
					</span>
					<span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono font-medium text-[11px] text-emerald-600 dark:text-emerald-400">
						2,847 commits in the last year
					</span>
				</div>
				<span className="font-mono text-[11.5px] text-text-sub-600 dark:text-white/50">
					Ship daily. Iterate faster.
				</span>
			</div>

			{/* Heatmap Grid */}
			<div className="overflow-x-auto pb-1">
				<div className="min-w-[620px]">
					{/* Month Headers */}
					<div className="mb-1.5 flex justify-between pl-7 pr-2 font-mono text-[10.5px] text-text-sub-600 dark:text-white/45">
						{monthLabels.map((m) => (
							<span key={m}>{m}</span>
						))}
					</div>

					{/* Days and Squares */}
					<div className="flex items-start gap-1.5">
						{/* Day labels */}
						<div className="flex flex-col justify-between py-0.5 font-mono text-[9.5px] text-text-sub-600 dark:text-white/45">
							<span className="h-3 leading-3">Mon</span>
							<span className="h-3 leading-3">Wed</span>
							<span className="h-3 leading-3">Fri</span>
						</div>

						{/* Contribution columns */}
						<div className="flex flex-1 items-center gap-[3px]">
							{weeks.map((week, wIndex) => (
								<div
									key={wIndex}
									className="flex flex-col gap-[3px]"
								>
									{week.map((level, dIndex) => (
										<div
											key={dIndex}
											className={`size-[10.5px] rounded-[2px] border transition-colors hover:ring-1 hover:ring-emerald-400 ${getLevelColor(level)}`}
											title={`${level > 0 ? `${level * 3} contributions` : "No contributions"}`}
										/>
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Graph Footer */}
			<div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-text-sub-600 dark:text-white/50">
				<a
					href="https://github.com/reloop-labs/reloop"
					target="_blank"
					rel="noopener noreferrer"
					className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
				>
					View commit log on GitHub →
				</a>
				<div className="flex items-center gap-1.5">
					<span>Less</span>
					<div className="flex items-center gap-1">
						<span className="size-2.5 rounded-[2px] bg-[#ebedf0] dark:bg-[#161b22]" />
						<span className="size-2.5 rounded-[2px] bg-[#9be9a8] dark:bg-[#0e4429]" />
						<span className="size-2.5 rounded-[2px] bg-[#40c463] dark:bg-[#006d32]" />
						<span className="size-2.5 rounded-[2px] bg-[#30a14e] dark:bg-[#26a641]" />
						<span className="size-2.5 rounded-[2px] bg-[#216e39] dark:bg-[#39d353]" />
					</div>
					<span>More</span>
				</div>
			</div>
		</div>
	);
}
