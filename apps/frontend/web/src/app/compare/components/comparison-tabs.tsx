"use client";

import { cn } from "@reloop/ui/cn";
import { useState } from "react";
import {
	ComparisonTable,
	type ComparisonFeatureRow,
} from "./comparison-table";

export type ComparisonCategory = {
	id: string;
	label: string;
	intro?: string;
	features: ComparisonFeatureRow[];
};

export function ComparisonTabs({
	competitorName,
	categories,
}: {
	competitorName: string;
	categories: ComparisonCategory[];
}) {
	const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
	const active =
		categories.find((category) => category.id === activeId) ?? categories[0];

	if (!active) {
		return null;
	}

	return (
		<div>
			<div
				className="mb-8 flex flex-wrap justify-center gap-2"
				role="tablist"
				aria-label="Comparison categories"
			>
				{categories.map((category) => {
					const selected = category.id === active.id;
					return (
						<button
							key={category.id}
							type="button"
							role="tab"
							aria-selected={selected}
							onClick={() => setActiveId(category.id)}
							className={cn(
								"rounded-full px-4 py-2 font-medium text-[13px] transition-colors",
								selected
									? "bg-text-strong-950 text-white dark:bg-white dark:text-text-strong-950"
									: "bg-bg-weak-50 text-text-sub-600 hover:text-text-strong-950 dark:bg-white/[0.06] dark:text-white/55 dark:hover:text-white",
							)}
						>
							{category.label}
						</button>
					);
				})}
			</div>

			{active.intro ? (
				<p className="mx-auto mb-8 max-w-3xl text-center text-[15px] text-text-sub-600 leading-7 dark:text-white/50">
					{active.intro}
				</p>
			) : null}

			<ComparisonTable
				competitorName={competitorName}
				features={active.features}
			/>
		</div>
	);
}
