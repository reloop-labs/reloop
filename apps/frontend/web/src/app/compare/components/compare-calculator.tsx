import { CompareCostColumn } from "./compare-cost-column";

export function CompareCalculator() {
	return (
		<div className="flex w-full flex-col lg:flex-row lg:items-stretch">
			<div className="flex-1 py-10 sm:py-12 lg:border-stroke-soft-100 lg:border-r lg:pr-8 xl:pr-12 dark:lg:border-white/10">
				<CompareCostColumn mode="transactional" />
			</div>
			<div className="flex-1 border-stroke-soft-100 border-t py-10 sm:py-12 lg:border-t-0 lg:pl-8 xl:pl-12 dark:border-white/10">
				<CompareCostColumn mode="marketing" />
			</div>
		</div>
	);
}
