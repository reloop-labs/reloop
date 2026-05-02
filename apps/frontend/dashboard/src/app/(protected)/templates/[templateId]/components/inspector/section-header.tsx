/* ------------------------------------------------------------------ */
/* Collapsible section header                                           */
/* ------------------------------------------------------------------ */
export function SectionHeader({ label }: { label: string }) {
	return (
		<div className="flex w-full items-center justify-between py-2 font-semibold text-sm text-text-strong-950">
			<span>{label}</span>
		</div>
	);
}
