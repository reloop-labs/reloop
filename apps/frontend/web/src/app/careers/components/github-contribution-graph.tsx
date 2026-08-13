"use client";

import { useMemo } from "react";

// Generate deterministic realistic contribution activity data
function generateContributions(weeksCount = 52) {
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
				if (r > 0.8) level = 4;
				else if (r > 0.55) level = 3;
				else if (r > 0.3) level = 2;
				else if (r > 0.1) level = 1;
				else level = 0;
			} else {
				if (r > 0.85) level = 2;
				else if (r > 0.6) level = 1;
				else level = 0;
			}
			week.push(level);
		}
		matrix.push(week);
	}
	return matrix;
}

export function GitHubContributionGraph() {
	const weeks = useMemo(() => generateContributions(54), []);

	const getLevelColor = (level: number) => {
		switch (level) {
			case 1:
				return "bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700";
			case 2:
				return "bg-neutral-400 dark:bg-neutral-600 border-neutral-500 dark:border-neutral-500";
			case 3:
				return "bg-neutral-600 dark:bg-neutral-400 border-neutral-700 dark:border-neutral-300";
			case 4:
				return "bg-neutral-900 dark:bg-neutral-100 border-black dark:border-white";
			default:
				return "bg-black/[0.04] dark:bg-white/[0.04] border-black/5 dark:border-white/5";
		}
	};

	return (
		<div className="flex w-full justify-center overflow-x-auto py-2 lg:justify-start">
			<div className="flex items-center gap-[3px]">
				{weeks.map((week, wIndex) => (
					<div key={wIndex} className="flex flex-col gap-[3px]">
						{week.map((level, dIndex) => (
							<div
								key={dIndex}
								className={`size-[11px] rounded-[2px] border transition-colors hover:ring-1 hover:ring-neutral-400 dark:hover:ring-white/40 ${getLevelColor(level)}`}
								title={`${level > 0 ? `${level * 3} contributions` : "No contributions"}`}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
