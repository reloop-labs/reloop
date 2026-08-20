import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { ComparisonBrandCards } from "./comparison-grid";

export function CompareOtherLinks({ currentHref }: { currentHref: string }) {
	return (
		<div className="w-full">
			<div className="flex items-end justify-between gap-4">
				<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
					More comparisons
				</h2>
				<Link
					href="/compare"
					className="hidden items-center gap-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 sm:inline-flex dark:text-white/50 dark:hover:text-white"
				>
					View all
					<Icon name="arrow-right" className="size-3.5" aria-hidden />
				</Link>
			</div>

			<div className="mt-8">
				<ComparisonBrandCards excludeHref={currentHref} />
			</div>
		</div>
	);
}
