export function SectionHeader({ label }: { label: string }) {
	return (
		<p className="px-4 pt-3 font-semibold text-label-xs text-text-sub-600 uppercase tracking-wide">
			{label}
		</p>
	);
}
