/**
 * Numbered section marker — `01. HOW IT WORKS` — its own bordered title
 * strip. Surround it with empty space; content sections open below it.
 */
export function SectionMark({
	index,
	label,
}: {
	index: string;
	label: string;
}) {
	return (
		<div className="border-stroke-soft-100 border-y dark:border-white/10">
			<div className="flex items-center justify-start px-4 py-5 sm:px-8 lg:px-12">
				<span className="text-balance font-mono font-medium text-[13px] tracking-[-0.025em] uppercase">
					<span className="text-stone-950 dark:text-white">{index}.</span>{" "}
					<span className="text-stone-500 dark:text-white/40">{label}</span>
				</span>
			</div>
		</div>
	);
}
